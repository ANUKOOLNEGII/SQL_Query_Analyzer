import { openai } from '../../config/openai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export interface AISQLResponse {
  sql: string;
  explanation: string;
  suggestions: string[];
}

export const generateWithOpenAI = async (prompt: string): Promise<AISQLResponse> => {
  if (env.OPENAI_API_KEY.includes('placeholder')) {
    throw new Error('OpenAI API Key is placeholder. Fallback to Gemini.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(content) as AISQLResponse;
  } catch (error: any) {
    logger.error('OpenAI generation failed:', error);
    throw error;
  }
};
