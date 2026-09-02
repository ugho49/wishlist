import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { ItemDataLoaderFactory } from './item.dataloader';
import { ItemTakerFieldResolver } from './item.field-resolver';
import { ItemResolver } from './item.resolver';
import { ItemNotificationsProcessor } from './item-notifications.processor';

@Module({
  providers: [...handlers, ItemNotificationsProcessor, ItemResolver, ItemTakerFieldResolver, ItemDataLoaderFactory],
  exports: [ItemDataLoaderFactory],
})
export class ItemModule {}
