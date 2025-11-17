import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
  FRONTEND_BASE_URL: z.string('Missing FRONTEND_BASE_URL environment variable'),
})

export default registerAs('app', () => {
  const result = schema.safeParse(process.env)

  if (!result.success) {
    throw new Error(z.prettifyError(result.error))
  }

  const validatedConfig = result.data

  return {
    frontendBaseUrl: validatedConfig.FRONTEND_BASE_URL,
  }
})
