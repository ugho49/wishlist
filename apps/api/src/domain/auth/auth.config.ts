import { registerAs } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';

export default registerAs('auth', () => ({
  secret: process.env.AUTH_JWT_SECRET,
  duration: process.env.AUTH_JWT_DURATION || '1h',
  issuer: process.env.AUTH_JWT_ISSUER || '',
  algorithm: (process.env.AUTH_JWT_ALGORITHM || 'HS512') as Algorithm,
}));
