import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { ItemDataLoaderFactory } from './item.dataloader';
import { ItemResolver, ItemTakerFieldResolver } from './item.resolver';
import { ItemScheduler } from './item.scheduler';
import { ItemNotificationsProcessor } from './item-notifications.processor';

@Module({
  providers: [
    ...handlers,
    ItemScheduler,
    ItemNotificationsProcessor,
    ItemResolver,
    ItemTakerFieldResolver,
    ItemDataLoaderFactory,
  ],
  exports: [ItemDataLoaderFactory],
})
export class ItemModule {}
