import OpenAI from 'openai';
import { env } from './env';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY.includes('placeholder') ? 'mock-key' : env.OPENAI_API_KEY,
});
