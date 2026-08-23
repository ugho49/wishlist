import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { SecretSantaFieldResolver, SecretSantaUserFieldResolver } from './resolvers/secret-santa.field-resolver';
import { SecretSantaResolver } from './resolvers/secret-santa.resolver';

@Module({
  providers: [...handlers, SecretSantaResolver, SecretSantaFieldResolver, SecretSantaUserFieldResolver],
})
export class SecretSantaModule {}
