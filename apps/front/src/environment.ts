import z from 'zod'

const envSchema = z.object({
  VITE_ENV: z.enum(['development', 'production']),
  VITE_BASE_URL: z.string(),
  VITE_GOOGLE_CLIENT_ID: z.string(),
  VITE_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID: z.string(),
})

const parsedEnvironment = envSchema.parse(import.meta.env) as z.infer<typeof envSchema>

export const environment = {
  env: parsedEnvironment.VITE_ENV,
  baseUrl: parsedEnvironment.VITE_BASE_URL,
  googleClientId: parsedEnvironment.VITE_GOOGLE_CLIENT_ID,
  launchdarklyClientSideiD: parsedEnvironment.VITE_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID,
}
