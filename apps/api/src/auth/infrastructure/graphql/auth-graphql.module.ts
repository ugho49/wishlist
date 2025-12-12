import { Module } from '@nestjs/common'

import { AuthResolver } from './resolvers'

@Module({
  providers: [AuthResolver],
})
export class AuthGraphQLModule {}
