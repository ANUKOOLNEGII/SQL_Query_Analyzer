import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

export const gemini = new GoogleGenerativeAI(
  env.GEMINI_API_KEY.includes('placeholder') ? 'mock-key' : env.GEMINI_API_KEY
);
