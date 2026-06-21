import {
  deduplicateSuggestions,
  generateSchemaAwareFallbackSuggestions,
} from '../../src/services/ai-suggestion.service';
import { DatabaseSchemaSnapshot } from '../../src/services/schema.service';

describe('AI Suggestion Service Unit Tests', () => {
  const schema: DatabaseSchemaSnapshot = {
    tables: [
      {
        name: 'employees',
        columns: [
          { name: 'id', type: 'INT', primaryKey: true },
          { name: 'name', type: 'VARCHAR', primaryKey: false },
          { name: 'salary', type: 'DECIMAL', primaryKey: false },
          { name: 'department', type: 'VARCHAR', primaryKey: false },
          { name: 'joining_date', type: 'DATE', primaryKey: false },
        ],
      },
    ],
    relationships: [],
  };

  it('should deduplicate suggestions and reject SQL-like values', () => {
    const suggestions = deduplicateSuggestions([
      'Show top employees by salary',
      ' show top employees by salary ',
      'SELECT * FROM employees',
      'List employees grouped by department',
      'Find employees hired recently',
      'Count total employees',
    ]);

    expect(suggestions).toHaveLength(3);
    expect(suggestions.every((item) => !/^\s*SELECT/i.test(item))).toBe(true);
  });

  it('should generate schema-aware natural language fallback suggestions', () => {
    const suggestions = generateSchemaAwareFallbackSuggestions(
      schema,
      'Show employees earning more than 50000'
    );

    expect(suggestions).toHaveLength(3);
    expect(suggestions.every((item) => !/^\s*SELECT/i.test(item))).toBe(true);
    expect(suggestions.join(' ').toLowerCase()).toContain('salary');
  });
});
