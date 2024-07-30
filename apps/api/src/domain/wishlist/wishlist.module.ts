import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BucketModule } from '../../core/bucket/bucket.module'
import { EventModule } from '../event/event.module'
import { WishlistController } from './wishlist.controller'
import { WishlistEntity } from './wishlist.entity'
import { WishlistRepository } from './wishlist.repository'
import { WishlistService } from './wishlist.service'

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity]), EventModule, BucketModule],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
  exports: [WishlistRepository],
})
export class WishlistModule {}
