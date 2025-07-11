import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config()

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: false,
  },
})
