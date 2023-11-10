import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistController } from './wishlist.controller';
import { WishlistEntity } from './wishlist.entity';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';
import { EventModule } from '../event/event.module';
import { BucketModule } from '../../core/bucket/bucket.module';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity]), EventModule, BucketModule],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
  exports: [WishlistRepository],
})
export class WishlistModule {}
