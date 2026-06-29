import { openai } from '../config/openai';
import { gemini } from '../config/gemini';
import { groq } from '../config/groq';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { DatabaseSchemaSnapshot } from './schema.service';

export type SuggestionSource = 'groq' | 'openai' | 'gemini' | 'fallback';

export interface SuggestionResult {
  suggestions: string[];
  source: SuggestionSource;
}

const normalizeForDedup = (text: string): string =>
  text.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');

const isSqlLike = (text: string): boolean =>
  /^\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|WITH|TRUNCATE)\b/i.test(text);

export const deduplicateSuggestions = (suggestions: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of suggestions) {
    if (!raw || isSqlLike(raw)) continue;
    const normalized = normalizeForDedup(raw);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(raw.trim());
    if (result.length >= 3) break;
  }

  return result;
};

const humanizeColumn = (columnName: string): string =>
  columnName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const humanizeTable = (tableName: string): string =>
  tableName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export const generateSchemaAwareFallbackSuggestions = (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string
): string[] => {
  if (!schema.tables.length) {
    return [
      'Show a sample of available records',
      'Count total records in the dataset',
      'Summarize key metrics from the data',
    ];
  }

  const queryLower = naturalQuery.toLowerCase();
  const matchedTable =
    schema.tables.find((tbl) => queryLower.includes(tbl.name.toLowerCase())) || schema.tables[0];
  const tableLabel = humanizeTable(matchedTable.name);
  const suggestions: string[] = [];

  const salaryCol = matchedTable.columns.find((col) => /salary|pay|wage|income|price|amount/i.test(col.name));
  const dateCol = matchedTable.columns.find((col) =>
    /date|time|created|updated|joined|hire|timestamp/i.test(col.name)
  );
  const deptCol = matchedTable.columns.find((col) =>
    /department|dept|category|group|type|status/i.test(col.name)
  );
  const nameCol = matchedTable.columns.find((col) => /name|title|label/i.test(col.name));

  if (salaryCol) {
    suggestions.push(`Show top 10 ${tableLabel.toLowerCase()} by ${humanizeColumn(salaryCol.name).toLowerCase()}`);
    suggestions.push(`Show average ${humanizeColumn(salaryCol.name).toLowerCase()} by ${deptCol ? humanizeColumn(deptCol.name).toLowerCase() : 'category'}`);
    suggestions.push(`Find the highest paid ${tableLabel.toLowerCase().replace(/s$/, '')}`);
  }

  if (dateCol) {
    suggestions.push(`Show recent ${tableLabel.toLowerCase()} from the last 30 days`);
    suggestions.push(`Show ${tableLabel.toLowerCase()} grouped by month`);
    suggestions.push(`Find ${tableLabel.toLowerCase()} added in the last year`);
  }

  if (deptCol && !salaryCol) {
    suggestions.push(`List ${tableLabel.toLowerCase()} grouped by ${humanizeColumn(deptCol.name).toLowerCase()}`);
    suggestions.push(`Count ${tableLabel.toLowerCase()} in each ${humanizeColumn(deptCol.name).toLowerCase()}`);
  }

  if (schema.relationships.length) {
    const relation = schema.relationships[0];
    suggestions.push(
      `Show ${humanizeTable(relation.sourceTable).toLowerCase()} with related ${humanizeTable(relation.targetTable).toLowerCase()} details`
    );
  }

  if (nameCol) {
    suggestions.push(`Search ${tableLabel.toLowerCase()} by ${humanizeColumn(nameCol.name).toLowerCase()}`);
  }

  suggestions.push(`Count total ${tableLabel.toLowerCase()}`);
  suggestions.push(`Show summary statistics for ${tableLabel.toLowerCase()}`);
  suggestions.push(`List all ${tableLabel.toLowerCase()} sorted by most recent`);

  return deduplicateSuggestions(suggestions);
};

const ensureThreeSuggestions = (
  primary: string[],
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string
): string[] => {
  const merged = deduplicateSuggestions([
    ...primary,
    ...generateSchemaAwareFallbackSuggestions(schema, naturalQuery),
  ]);

  while (merged.length < 3) {
    merged.push(`Explore more insights about ${humanizeTable(schema.tables[0]?.name || 'the data').toLowerCase()}`);
    const deduped = deduplicateSuggestions(merged);
    if (deduped.length >= 3) return deduped.slice(0, 3);
    merged.push(`Show a different view of ${humanizeTable(schema.tables[0]?.name || 'the data').toLowerCase()}`);
  }

  return merged.slice(0, 3);
};

const buildSuggestionPrompt = (
  naturalLanguageQuery: string,
  schema: DatabaseSchemaSnapshot,
  generatedSQL: string
): string => {
  const schemaText = schema.tables
    .map((tbl) => {
      const cols = tbl.columns
        .map((c) => `${c.name} (${c.type}${c.primaryKey ? ' PK' : ''})`)
        .join(', ');
      return `Table: ${tbl.name}\nColumns: ${cols}`;
    })
    .join('\n\n');

  const relationsText = schema.relationships
    .map((r) => `${r.sourceTable}.${r.sourceColumn} -> ${r.targetTable}.${r.targetColumn}`)
    .join('\n');

  return `
You are an expert data analyst assistant. Generate exactly 3 alternative natural language questions based on the user's intent.

User Query: "${naturalLanguageQuery}"

Generated SQL:
${generatedSQL}

Database Schema:
${schemaText || 'No schema available'}

${relationsText ? `Relationships:\n${relationsText}` : ''}

Rules:
- Return ONLY human-readable natural language questions
- Do NOT return SQL statements
- Each suggestion must be related to the user's intent
- Use existing tables and columns from the schema
- Suggestions must be useful follow-up questions
- All 3 suggestions must be unique
- Do not duplicate the original user query

Return your response ONLY as a JSON object:
{
  "suggestions": [
    "Alternative question 1",
    "Alternative question 2",
    "Alternative question 3"
  ]
}
`;
};

const parseSuggestionResponse = (content: string): string[] => {
  const parsed = JSON.parse(content) as { suggestions?: string[] };
  if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
    throw new Error('Invalid suggestions response format');
  }
  return parsed.suggestions;
};

const generateSuggestionsWithOpenAI = async (prompt: string): Promise<string[]> => {
  if (env.OPENAI_API_KEY.includes('placeholder')) {
    throw new Error('OpenAI API Key is placeholder');
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  return parseSuggestionResponse(content);
};

const generateSuggestionsWithGemini = async (prompt: string): Promise<string[]> => {
  if (env.GEMINI_API_KEY.includes('placeholder')) {
    throw new Error('Gemini API Key is placeholder');
  }

  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  if (!responseText) {
    throw new Error('Empty response from Gemini');
  }

  return parseSuggestionResponse(responseText.trim());
};

const generateSuggestionsWithGroq = async (prompt: string): Promise<string[]> => {
  if (env.GROQ_API_KEY.includes('placeholder')) {
    throw new Error('Groq API Key is placeholder');
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from Groq');
  }

  return parseSuggestionResponse(content);
};

export const generateSuggestions = async (
  naturalLanguageQuery: string,
  schema: DatabaseSchemaSnapshot,
  generatedSQL: string
): Promise<SuggestionResult> => {
  const prompt = buildSuggestionPrompt(naturalLanguageQuery, schema, generatedSQL);

  try {
    const aiSuggestions = deduplicateSuggestions(await generateSuggestionsWithGroq(prompt));
    if (aiSuggestions.length > 0) {
      const suggestions = ensureThreeSuggestions(aiSuggestions, schema, naturalLanguageQuery);
      logger.info('Query suggestions generated', { source: 'groq', count: suggestions.length });
      return { suggestions, source: 'groq' };
    }
  } catch (groqErr: any) {
    logger.warn(`Groq suggestion generation failed: ${groqErr.message}. Trying OpenAI.`);
  }

  try {
    const aiSuggestions = deduplicateSuggestions(await generateSuggestionsWithOpenAI(prompt));
    if (aiSuggestions.length > 0) {
      const suggestions = ensureThreeSuggestions(aiSuggestions, schema, naturalLanguageQuery);
      logger.info('Query suggestions generated', { source: 'openai', count: suggestions.length });
      return { suggestions, source: 'openai' };
    }
  } catch (openaiErr: any) {
    logger.warn(`OpenAI suggestion generation failed: ${openaiErr.message}. Trying Gemini.`);
  }

  try {
    const aiSuggestions = deduplicateSuggestions(await generateSuggestionsWithGemini(prompt));
    if (aiSuggestions.length > 0) {
      const suggestions = ensureThreeSuggestions(aiSuggestions, schema, naturalLanguageQuery);
      logger.info('Query suggestions generated', { source: 'gemini', count: suggestions.length });
      return { suggestions, source: 'gemini' };
    }
  } catch (geminiErr: any) {
    logger.warn(`Gemini suggestion generation failed: ${geminiErr.message}. Using fallback.`);
  }

  const suggestions = ensureThreeSuggestions(
    generateSchemaAwareFallbackSuggestions(schema, naturalLanguageQuery),
    schema,
    naturalLanguageQuery
  );
  logger.info('Query suggestions generated', { source: 'fallback', count: suggestions.length });
  return { suggestions, source: 'fallback' };
};
