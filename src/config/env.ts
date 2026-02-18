import { z } from 'zod';

// ============ Environment Schema ============

const envSchema = z.object({
  // API URL - optional, defaults to localhost
  VITE_API_URL: z.string().url().optional(),

  // Vite built-in variables
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
  SSR: z.boolean().default(false),
  BASE_URL: z.string().default('/'),
});

// ============ Type Export ============

export type Env = z.infer<typeof envSchema>;

// ============ Environment Parsing ============

function parseEnv(): Env {
  const rawEnv = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    SSR: import.meta.env.SSR,
    BASE_URL: import.meta.env.BASE_URL,
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);

    // In development, show detailed errors
    if (import.meta.env.DEV) {
      throw new Error(
        `Invalid environment variables:\n${JSON.stringify(result.error.flatten().fieldErrors, null, 2)}`,
      );
    }

    // In production, fail silently but log
    console.error('Environment validation failed, using defaults');
    return envSchema.parse({});
  }

  return result.data;
}

// ============ Validated Environment ============

export const env = parseEnv();

// ============ Derived Values ============

export const API_BASE_URL = env.VITE_API_URL || 'http://localhost:4000/api';
export const IS_DEV = env.DEV;
export const IS_PROD = env.PROD;
