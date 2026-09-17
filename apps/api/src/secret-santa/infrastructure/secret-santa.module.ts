import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { SecretSantaFieldResolver, SecretSantaUserFieldResolver } from './resolvers/secret-santa.field-resolver';
import { SecretSantaResolver } from './resolvers/secret-santa.resolver';
import { SecretSantaDataLoaderFactory } from './secret-santa.dataloader';

@Module({
  providers: [
    ...handlers,
    SecretSantaResolver,
    SecretSantaFieldResolver,
    SecretSantaUserFieldResolver,
    SecretSantaDataLoaderFactory,
  ],
  exports: [SecretSantaDataLoaderFactory],
})
export class SecretSantaModule {}
