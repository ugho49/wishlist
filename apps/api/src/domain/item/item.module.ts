import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';
import { WishlistModule } from '../wishlist/wishlist.module';
import { ItemScheduler } from './item.scheduler';
import { ItemMailer } from './item.mailer';
import { UserModule } from '../user/user.module';
import { ScrapperService } from './scrapper.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity]), WishlistModule, UserModule],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, ItemScheduler, ItemMailer, ScrapperService],
})
export class ItemModule {}
