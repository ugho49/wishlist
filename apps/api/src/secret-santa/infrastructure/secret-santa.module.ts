import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { SecretSantaController } from './controllers/secret-santa.controller'
import { SecretSantaAdminController } from './controllers/secret-santa-admin.controller'
import { SecretSantaResolver } from './resolvers/secret-santa.resolver'
import { SecretSantaUserResolver } from './resolvers/secret-santa-user.resolver'
import { SecretSantaDataLoaderFactory } from './secret-santa.dataloader'

@Module({
  controllers: [SecretSantaController, SecretSantaAdminController],
  providers: [...handlers, SecretSantaResolver, SecretSantaUserResolver, SecretSantaDataLoaderFactory],
  exports: [SecretSantaDataLoaderFactory],
})
export class SecretSantaModule {}
