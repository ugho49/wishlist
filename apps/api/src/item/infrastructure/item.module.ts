import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { ItemResolver, ItemTakerFieldResolver } from './item.resolver';
import { ItemScheduler } from './item.scheduler';
import { ItemNotificationsProcessor } from './item-notifications.processor';

@Module({
  providers: [ItemScheduler, ItemNotificationsProcessor, ItemResolver, ItemTakerFieldResolver, ...handlers],
})
export class ItemModule {}
