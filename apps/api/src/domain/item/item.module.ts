import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';
import { WishlistModule } from '../wishlist/wishlist.module';
import { ItemScheduler } from './item.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity]), WishlistModule],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, ItemScheduler],
})
export class ItemModule {}
