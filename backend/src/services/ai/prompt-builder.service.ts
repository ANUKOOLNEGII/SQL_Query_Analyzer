import { DatabaseSchemaSnapshot } from '../schema.service';

export const buildPrompt = (
  schema: DatabaseSchemaSnapshot,
  naturalQuery: string,
  dbType: string
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
You are an expert SQL generator. Your task is to translate a natural language question into a single, syntactically correct SQL query for a ${dbType} database.

Here is the database schema:
${schemaText}

${relationsText ? `Relationships:\n${relationsText}` : ''}

Natural Language Question: "${naturalQuery}"

Return your response ONLY as a JSON object matching this structure:
{
  "sql": "SELECT ...",
  "explanation": "Brief explanation..."
}

DO NOT include any markdown code blocks (e.g. \`\`\`json) or other text around the JSON object. Just return the raw JSON.
`;
};
