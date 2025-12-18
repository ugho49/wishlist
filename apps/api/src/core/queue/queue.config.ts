import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
  VALKEY_KEY_PREFIX: z.string('Missing VALKEY_KEY_PREFIX environment variable'),
  VALKEY_HOST: z.string('Missing VALKEY_HOST environment variable'),
  VALKEY_PORT: z.coerce.number('Missing VALKEY_PORT environment variable'),
  VALKEY_PASSWORD: z.string('Missing VALKEY_PASSWORD environment variable'),
  VALKEY_DB: z.coerce.number('Missing VALKEY_DB environment variable'),
  SCHEDULED_JOBS_ENABLED: z.boolean('Missing SCHEDULED_JOBS_ENABLED environment variable').optional().default(true),
})

export default registerAs('queue', () => {
  const result = schema.safeParse(process.env)

  if (!result.success) {
    throw new Error(z.prettifyError(result.error))
  }

  const validatedConfig = result.data

  return {
    valkey: {
      keyPrefix: validatedConfig.VALKEY_KEY_PREFIX,
      host: validatedConfig.VALKEY_HOST,
      port: validatedConfig.VALKEY_PORT,
      password: validatedConfig.VALKEY_PASSWORD,
      db: validatedConfig.VALKEY_DB,
    },
    scheduledJobsEnabled: validatedConfig.SCHEDULED_JOBS_ENABLED,
  }
})
