import { Module } from '@nestjs/common'

import { EventResolver } from './resolvers'

@Module({
  providers: [EventResolver],
})
export class EventGraphQLModule {}
