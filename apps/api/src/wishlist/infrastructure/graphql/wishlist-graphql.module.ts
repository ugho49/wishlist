import { Module } from '@nestjs/common'

import { WishlistResolver } from './resolvers'

@Module({
  providers: [WishlistResolver],
})
export class WishlistGraphQLModule {}
