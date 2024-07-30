import { registerAs } from '@nestjs/config'

export default registerAs('mail', () => ({
  from: 'Wishlist App <contact@wishlistapp.fr>',
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '1025', 10),
  auth: {
    username: process.env.MAIL_USERNAME || '',
    password: process.env.MAIL_PASSWORD || '',
  },
}))
