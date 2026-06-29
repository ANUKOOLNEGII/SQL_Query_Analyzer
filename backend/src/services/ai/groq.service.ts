import { groq } from '../../config/groq';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AISQLResponse } from './openai.service';

export const generateWithGroq = async (prompt: string): Promise<AISQLResponse> => {
  if (env.GROQ_API_KEY.includes('placeholder')) {
    throw new Error('Groq API Key is placeholder.');
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    return JSON.parse(content) as AISQLResponse;
  } catch (error: any) {
    logger.error('Groq generation failed:', error);
    throw error;
  }
};
