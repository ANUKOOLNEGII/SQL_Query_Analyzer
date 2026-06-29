import { DatabaseSchemaSnapshot } from '../schema.service';
import { buildPrompt } from './prompt-builder.service';
import { generateWithOpenAI } from './openai.service';
import { generateWithGemini } from './gemini.service';
import { generateWithGroq } from './groq.service';
import { generateSuggestions, SuggestionSource } from '../ai-suggestion.service';
import { logger } from '../../config/logger';

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  provider?: 'groq' | 'openai' | 'gemini';
}

export interface AISQLResponse {
  sql: string;
  explanation: string;
  suggestions: string[];
  suggestionSource?: SuggestionSource;
}

export const generateMockSQL = (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string,
  _dbType: string
): Pick<AISQLResponse, 'sql' | 'explanation'> => {
  const queryLower = naturalQuery.toLowerCase();

  if (schema.tables.length === 0) {
    return {
      sql: 'SELECT * FROM mock_table LIMIT 10;',
      explanation: 'Returned 10 records from placeholder mock_table due to empty schema.',
    };
  }

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

  if (queryLower.includes('top 10') || queryLower.includes('first 10') || queryLower.includes('limit 10')) {
    sql = `SELECT * FROM ${targetTable} LIMIT 10;`;
    explanation = `Retrieve the first 10 rows from the ${targetTable} table.`;
  } else if (queryLower.includes('count') || queryLower.includes('total') || queryLower.includes('how many')) {
    sql = `SELECT COUNT(*) AS total FROM ${targetTable};`;
    explanation = `Count the total number of records in the ${targetTable} table.`;
  } else if (
    queryLower.includes('salary') ||
    queryLower.includes('greater') ||
    queryLower.includes('above') ||
    queryLower.includes('>')
  ) {
    const matchedCol =
      cols.find(
        (c) =>
          c.toLowerCase().includes('salary') ||
          c.toLowerCase().includes('price') ||
          c.toLowerCase().includes('marks')
      ) || primaryKeyCol;
    sql = `SELECT * FROM ${targetTable} WHERE ${matchedCol} > 50000;`;
    explanation = `Filter records from ${targetTable} where ${matchedCol} is greater than 50,000.`;
  }

  return { sql, explanation };
};

export const generateSQLQuery = async (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string,
  dbType: string,
  aiOptions?: AIOptions
): Promise<AISQLResponse> => {
  const prompt = buildPrompt(schema, naturalQuery, dbType);
  const opts = aiOptions || {};
  const preferredProvider = opts.provider || 'groq';
  let sqlResult: Pick<AISQLResponse, 'sql' | 'explanation'>;

  // Build provider attempt order based on user preference
  const providerOrder: Array<'groq' | 'openai' | 'gemini'> = [preferredProvider];
  if (preferredProvider !== 'groq') providerOrder.push('groq');
  if (preferredProvider !== 'openai') providerOrder.push('openai');
  if (preferredProvider !== 'gemini') providerOrder.push('gemini');

  sqlResult = { sql: '', explanation: '' };
  let lastError: any = null;

  for (const p of providerOrder) {
    try {
      logger.info(`Attempting SQL generation with provider: ${p}`);
      if (p === 'groq') {
        sqlResult = await generateWithGroq(prompt, opts);
      } else if (p === 'openai') {
        sqlResult = await generateWithOpenAI(prompt, opts);
      } else {
        sqlResult = await generateWithGemini(prompt, opts);
      }
      lastError = null;
      break; // success
    } catch (err: any) {
      logger.warn(`Provider ${p} failed: ${err.message}`);
      lastError = err;
    }
  }

  if (lastError) {
    logger.warn('All AI providers failed. Falling back to mock generator.');
    sqlResult = generateMockSQL(schema, naturalQuery, dbType);
  }

  const { suggestions, source } = await generateSuggestions(naturalQuery, schema, sqlResult.sql);

  return {
    sql: sqlResult.sql,
    explanation: sqlResult.explanation,
    suggestions,
    suggestionSource: source,
  };
};
