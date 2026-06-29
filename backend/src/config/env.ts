import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8).optional(),
  JWT_EXPIRE: z.string().default('15m'),
  JWT_REFRESH_EXPIRE: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional().default('placeholder_openai'),
  GEMINI_API_KEY: z.string().optional().default('placeholder_gemini'),
  GROQ_API_KEY: z.string().optional().default('placeholder_groq'),
  GROQ_MODEL: z.string().optional().default('llama-3.3-70b-versatile'),
  EMAIL_HOST: z.string().optional().default('placeholder_host'),
  EMAIL_PORT: z.coerce.number().optional().default(1025),
  EMAIL_USER: z.string().optional().default('placeholder_user'),
  EMAIL_PASSWORD: z.string().optional().default('placeholder_password'),
  EMAIL_FROM: z.string().email().default('noreply@aisqlgenerator.com'),
});

let validatedEnv;
try {
  const rawEnv = { ...process.env };
  if (!rawEnv.JWT_REFRESH_SECRET && rawEnv.JWT_SECRET) {
    rawEnv.JWT_REFRESH_SECRET = rawEnv.JWT_SECRET;
  }
  validatedEnv = envSchema.parse(rawEnv);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:', JSON.stringify(error.format(), null, 2));
  } else {
    console.error('❌ Environment validation failed:', error);
  }
  process.exit(1);
}

export const env = validatedEnv;
