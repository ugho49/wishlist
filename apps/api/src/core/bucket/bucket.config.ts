import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('bucket', () => {
  const firebaseServiceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || '';

  return {
    firebaseServiceAccountKeyPath: join(__dirname, firebaseServiceAccountKeyPath),
    bucketName: process.env.FIREBASE_BUCKET_NAME || '',
  };
});
