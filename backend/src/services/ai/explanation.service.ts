import { openai } from '../../config/openai';
import { gemini } from '../../config/gemini';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export const explainSQL = async (sql: string, dbType: string): Promise<string> => {
  const prompt = `Explain this SQL query for a ${dbType} database in 1-2 simple sentences:
  
  ${sql}
  
  Provide only the plain English explanation, no other text.`;

  if (!env.OPENAI_API_KEY.includes('placeholder')) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });
      return (completion.choices[0].message.content || '').trim();
    } catch (err) {
      logger.error('OpenAI explanation failed:', err);
    }
  }

  if (!env.GEMINI_API_KEY.includes('placeholder')) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return (result.response.text() || '').trim();
    } catch (err) {
      logger.error('Gemini explanation failed:', err);
    }
  }

  // Fallback explanation if no keys
  if (sql.toUpperCase().includes('COUNT')) {
    return 'Counts the total number of records that match the query criteria.';
  }
  if (sql.toUpperCase().includes('LIMIT')) {
    return 'Retrieves a limited number of records from the table.';
  }
  return 'Retrieves matching records from the database table.';
};
