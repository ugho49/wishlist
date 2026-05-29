import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { SecretSantaController } from './controllers/secret-santa.controller'
import { SecretSantaAdminController } from './controllers/secret-santa-admin.controller'
import { SecretSantaFieldResolver, SecretSantaUserFieldResolver } from './resolvers/secret-santa.field-resolver'
import { SecretSantaResolver } from './resolvers/secret-santa.resolver'

@Module({
  controllers: [SecretSantaController, SecretSantaAdminController],
  providers: [...handlers, SecretSantaResolver, SecretSantaFieldResolver, SecretSantaUserFieldResolver],
})
export class SecretSantaModule {}
