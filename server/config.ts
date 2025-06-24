import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().url('Invalid database URL'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  ADMIN_EMAIL: z.string().email('Invalid admin email'),
  ADMIN_PASSWORD: z.string().min(6, 'Admin password must be at least 6 characters'),
});

function validateConfig() {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export const config = validateConfig();

export type Config = z.infer<typeof configSchema>; 