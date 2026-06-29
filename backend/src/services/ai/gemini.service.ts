import { gemini } from '../../config/gemini';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AISQLResponse } from './openai.service';
import type { AIOptions } from './sql-generator.service';

export const generateWithGemini = async (prompt: string, opts?: AIOptions): Promise<AISQLResponse> => {
  if (env.GEMINI_API_KEY.includes('placeholder')) {
    throw new Error('Gemini API Key is placeholder. Mock fallback required.');
  }

  try {
    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: opts?.temperature ?? 0.2,
        maxOutputTokens: opts?.maxTokens ?? 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    return JSON.parse(responseText.trim()) as AISQLResponse;
  } catch (error: any) {
    logger.error('Gemini generation failed:', error);
    throw error;
  }
};
