import { registerAs } from '@nestjs/config'

export default registerAs('app', () => {
  return {
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:4200',
  }
})
