import { Config, Env } from '@znight/config';

import { path } from '../../helpers';

/** Firebase storage bucket of the uploaded pictures. */
@Config('firebase')
export class BucketConfig {
  @Env('FIREBASE_SERVICE_ACCOUNT_KEY_PATH') firebaseServiceAccountKeyPath: string = path(
    'firebase/firebase-config.json',
  );
  @Env('FIREBASE_BUCKET_NAME') bucketName = '';
  @Env('FIREBASE_BUCKET_MOCK') isMock = false;
}
