import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { WishlistMessageController } from './controllers/wishlist-message.controller'

@Module({
  controllers: [WishlistMessageController],
  providers: [...handlers],
})
export class WishlistMessageModule {}
