import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module.js'
import { WishlistController } from './wishlist.controller.js'
import { WishlistEntity } from './wishlist.entity.js'
import { WishlistRepository } from './wishlist.repository.js'
import { WishlistService } from './wishlist.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity]), EventModule],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
  exports: [WishlistRepository],
})
export class WishlistModule {}
