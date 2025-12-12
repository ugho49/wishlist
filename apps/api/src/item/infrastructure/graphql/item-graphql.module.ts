import { Module } from '@nestjs/common'

import { ItemResolver } from './resolvers'

@Module({
  providers: [ItemResolver],
})
export class ItemGraphQLModule {}
