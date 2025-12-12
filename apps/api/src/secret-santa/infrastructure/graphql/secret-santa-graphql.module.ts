import { Module } from '@nestjs/common'

import { SecretSantaResolver } from './resolvers'

@Module({
  providers: [SecretSantaResolver],
})
export class SecretSantaGraphQLModule {}
