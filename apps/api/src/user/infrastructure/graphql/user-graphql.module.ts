import { Module } from '@nestjs/common'

import { UserEmailSettingsResolver, UserResolver } from './resolvers'

@Module({
  providers: [UserResolver, UserEmailSettingsResolver],
})
export class UserGraphQLModule {}
