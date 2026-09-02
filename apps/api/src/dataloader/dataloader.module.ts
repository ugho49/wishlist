import { Module } from '@nestjs/common';

import { EventModule } from '../event/infrastructure/event.module';
import { ItemModule } from '../item/infrastructure/item.module';
import { UserModule } from '../user/infrastructure/user.module';
import { WishlistModule } from '../wishlist/infrastructure/wishlist.module';
import { DataLoaderService } from './dataloader.service';

@Module({
  imports: [EventModule, WishlistModule, UserModule, ItemModule],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
