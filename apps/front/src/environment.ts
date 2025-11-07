export const environment = {
  env: import.meta.env.VITE_ENV as 'development' | 'production',
  baseUrl: import.meta.env.VITE_BASE_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  launchdarklyClientSideiD: import.meta.env.VITE_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID,
}
