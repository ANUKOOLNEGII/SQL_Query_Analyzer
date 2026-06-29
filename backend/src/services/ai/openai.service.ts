import { openai } from '../../config/openai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { AIOptions } from './sql-generator.service';

export interface AISQLResponse {
  sql: string;
  explanation: string;
}

export const generateWithOpenAI = async (prompt: string, opts?: AIOptions): Promise<AISQLResponse> => {
  if (env.OPENAI_API_KEY.includes('placeholder')) {
    throw new Error('OpenAI API Key is placeholder. Fallback to Gemini.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: opts?.temperature ?? 0.2,
      max_tokens: opts?.maxTokens ?? 2048,
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
