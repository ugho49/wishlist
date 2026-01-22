import { registerAs } from '@nestjs/config'
import { mapConfigOrThrow } from '@wishlist/common'
import { z } from 'zod'

const schema = z.object({
  VALKEY_KEY_PREFIX: z.string('Missing VALKEY_KEY_PREFIX environment variable'),
  VALKEY_HOST: z.string('Missing VALKEY_HOST environment variable'),
  VALKEY_PORT: z.coerce.number('Missing VALKEY_PORT environment variable'),
  VALKEY_PASSWORD: z.string('Missing VALKEY_PASSWORD environment variable'),
  VALKEY_DB: z.coerce.number('Missing VALKEY_DB environment variable'),
  SCHEDULED_JOBS_ENABLED: z
    .enum(['true', 'false'], { message: 'Missing SCHEDULED_JOBS_ENABLED environment variable' })
    .transform(val => val === 'true')
    .optional()
    .default(true),
})

export default registerAs('queue', () =>
  mapConfigOrThrow(schema, process.env, data => ({
    valkey: {
      keyPrefix: data.VALKEY_KEY_PREFIX,
      host: data.VALKEY_HOST,
      port: data.VALKEY_PORT,
      password: data.VALKEY_PASSWORD,
      db: data.VALKEY_DB,
    },
    scheduledJobsEnabled: data.SCHEDULED_JOBS_ENABLED,
  })),
)
