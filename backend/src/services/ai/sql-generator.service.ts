import { DatabaseSchemaSnapshot } from '../schema.service';
import { buildPrompt } from './prompt-builder.service';
import { generateWithOpenAI, AISQLResponse } from './openai.service';
import { generateWithGemini } from './gemini.service';
import { logger } from '../../config/logger';

const normalizeSuggestions = (suggestions: string[]): string[] => {
  return Array.from(new Set(
    suggestions
      .filter(Boolean)
      .map((suggestion) => suggestion.trim().replace(/;$/, ''))
      .slice(0, 3)
  ));
};

const buildSchemaAwareSuggestions = (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string,
  dbType: string
): string[] => {
  if (!schema.tables.length) {
    return [
      'SELECT COUNT(*) AS total FROM mock_table',
      'SELECT * FROM mock_table ORDER BY id DESC',
      'SELECT name, COUNT(*) FROM mock_table GROUP BY name',
    ];
  }

  const queryLower = naturalQuery.toLowerCase();
  const matchedTable = schema.tables.find((tbl) => queryLower.includes(tbl.name.toLowerCase())) || schema.tables[0];
  const numericColumns = matchedTable.columns.filter((col) => /INT|DECIMAL|NUMERIC|FLOAT|MONEY|REAL|DOUBLE/.test(col.type));
  const stringColumns = matchedTable.columns.filter((col) => /CHAR|TEXT|VARCHAR|NVARCHAR|STRING/.test(col.type));
  const limitSyntax = dbType === 'sqlserver' ? 'TOP 10' : 'LIMIT 10';

  const suggestions: string[] = [];
  if (numericColumns.length) {
    suggestions.push(
      dbType === 'sqlserver'
        ? `SELECT TOP 10 * FROM ${matchedTable.name} ORDER BY ${numericColumns[0].name} DESC`
        : `SELECT * FROM ${matchedTable.name} ORDER BY ${numericColumns[0].name} DESC LIMIT 10`
    );
    if (stringColumns.length) {
      suggestions.push(
        dbType === 'sqlserver'
          ? `SELECT ${stringColumns[0].name}, AVG(${numericColumns[0].name}) AS average_${numericColumns[0].name} FROM ${matchedTable.name} GROUP BY ${stringColumns[0].name} ${limitSyntax}`
          : `SELECT ${stringColumns[0].name}, AVG(${numericColumns[0].name}) AS average_${numericColumns[0].name} FROM ${matchedTable.name} GROUP BY ${stringColumns[0].name} LIMIT 10`
      );
    }
  }

  if (schema.relationships.length) {
    const relation = schema.relationships[0];
    suggestions.push(
      `SELECT t1.*, t2.* FROM ${relation.sourceTable} t1 JOIN ${relation.targetTable} t2 ON t1.${relation.sourceColumn} = t2.${relation.targetColumn} LIMIT 10`
    );
  }

  if (!suggestions.length) {
    const defaultColumn = matchedTable.columns[0]?.name || '*';
    suggestions.push(`SELECT ${defaultColumn} FROM ${matchedTable.name} LIMIT 10`);
    suggestions.push(`SELECT COUNT(*) AS total FROM ${matchedTable.name}`);
    suggestions.push(`SELECT ${defaultColumn} FROM ${matchedTable.name} ORDER BY ${defaultColumn} DESC LIMIT 10`);
  }

  return normalizeSuggestions(suggestions);
};

export const generateMockSQL = (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string,
  _dbType: string
): AISQLResponse => {
  const queryLower = naturalQuery.toLowerCase();
  
  if (schema.tables.length === 0) {
    return {
      sql: 'SELECT * FROM mock_table LIMIT 10;',
      explanation: 'Returned 10 records from placeholder mock_table due to empty schema.',
      suggestions: [
        'SELECT COUNT(*) FROM mock_table;',
        'SELECT * FROM mock_table ORDER BY id DESC;'
      ]
    };
  }

  // Find most matching table name
  let targetTable = schema.tables[0].name;
  for (const tbl of schema.tables) {
    if (queryLower.includes(tbl.name.toLowerCase())) {
      targetTable = tbl.name;
      break;
    }
  }

  const table = schema.tables.find((t) => t.name === targetTable)!;
  const cols = table.columns.map((c) => c.name);
  const primaryKeyCol = table.columns.find((c) => c.primaryKey)?.name || cols[0] || 'id';

  let sql = `SELECT * FROM ${targetTable};`;
  let explanation = `Retrieve all columns and records from the ${targetTable} table.`;
  const suggestions = [
    `SELECT ${cols.slice(0, 2).join(', ') || '*'} FROM ${targetTable} LIMIT 10;`,
    `SELECT COUNT(*) AS total FROM ${targetTable};`,
    `SELECT * FROM ${targetTable} ORDER BY ${primaryKeyCol} DESC LIMIT 5;`
  ];

  if (queryLower.includes('top 10') || queryLower.includes('first 10') || queryLower.includes('limit 10')) {
    sql = `SELECT * FROM ${targetTable} LIMIT 10;`;
    explanation = `Retrieve the first 10 rows from the ${targetTable} table.`;
  } else if (queryLower.includes('count') || queryLower.includes('total') || queryLower.includes('how many')) {
    sql = `SELECT COUNT(*) AS total FROM ${targetTable};`;
    explanation = `Count the total number of records in the ${targetTable} table.`;
  } else if (queryLower.includes('salary') || queryLower.includes('greater') || queryLower.includes('above') || queryLower.includes('>')) {
    const matchedCol = cols.find((c) => c.toLowerCase().includes('salary') || c.toLowerCase().includes('price') || c.toLowerCase().includes('marks')) || primaryKeyCol;
    sql = `SELECT * FROM ${targetTable} WHERE ${matchedCol} > 50000;`;
    explanation = `Filter records from ${targetTable} where ${matchedCol} is greater than 50,000.`;
  }

  return { sql, explanation, suggestions };
};

export const generateSQLQuery = async (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string,
  dbType: string
): Promise<AISQLResponse> => {
  const prompt = buildPrompt(schema, naturalQuery, dbType);

  try {
    logger.info('Attempting SQL generation with OpenAI');
    const aiResponse = await generateWithOpenAI(prompt);
    const suggestionCandidates = buildSchemaAwareSuggestions(schema, naturalQuery, dbType);
    return {
      sql: aiResponse.sql,
      explanation: aiResponse.explanation,
      suggestions: normalizeSuggestions([...aiResponse.suggestions, ...suggestionCandidates]),
    };
  } catch (openaiErr: any) {
    logger.warn(`OpenAI failed: ${openaiErr.message}. Trying Gemini fallback.`);
    
    try {
      logger.info('Attempting SQL generation with Gemini');
      const aiResponse = await generateWithGemini(prompt);
      const suggestionCandidates = buildSchemaAwareSuggestions(schema, naturalQuery, dbType);
      return {
        sql: aiResponse.sql,
        explanation: aiResponse.explanation,
        suggestions: normalizeSuggestions([...aiResponse.suggestions, ...suggestionCandidates]),
      };
    } catch (geminiErr: any) {
      logger.warn(`Gemini failed: ${geminiErr.message}. Falling back to mock generator.`);
      return generateMockSQL(schema, naturalQuery, dbType);
    }
  }
};
export { AISQLResponse };
