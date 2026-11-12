import type { DrizzleDatabase } from '../../core/database/database.factory';

import { schema } from '@wishlist/api-drizzle';
import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { and, eq } from 'drizzle-orm';

import { type ItemDigestReceiptRepository } from '../../item/domain/item-digest-receipt.repository';

@Injectable()
export class PostgresItemDigestReceiptRepository implements ItemDigestReceiptRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async claim(params: { userId: UserId; digestDate: string }): Promise<boolean> {
    const inserted = await this.db
      .insert(schema.itemDigestReceipt)
      .values({ userId: params.userId, digestDate: params.digestDate })
      .onConflictDoNothing()
      .returning({ userId: schema.itemDigestReceipt.userId });

    return inserted.length > 0;
  }

  async release(params: { userId: UserId; digestDate: string }): Promise<void> {
    await this.db
      .delete(schema.itemDigestReceipt)
      .where(
        and(
          eq(schema.itemDigestReceipt.userId, params.userId),
          eq(schema.itemDigestReceipt.digestDate, params.digestDate),
        ),
      );
  }
}
