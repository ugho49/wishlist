import type { ItemId } from '@wishlist/common';
import type { ReservedItemsListPageQuery } from '../../gql';
import type { ReservedItem } from './reserved-items-purchase';

import {
  applyPurchaseChanges,
  bulkPurchaseState,
  nextBulkPurchase,
  snapshotPurchases,
} from './reserved-items-purchase';

const CURRENT_USER = 'user-me';
const CO_TAKER = 'user-other';
const PURCHASED_AT = '2026-11-20T10:00:00.000Z';

const itemId = (id: string) => id as ItemId;

const item = (id: string, purchasedAt: string | null = null): ReservedItem =>
  ({
    id: itemId(id),
    name: `Cadeau ${id}`,
    purchasedAt,
    takers: [
      { userId: CURRENT_USER, purchasedAt },
      { userId: CO_TAKER, purchasedAt: null },
    ],
  }) as unknown as ReservedItem;

const pageOf = (items: ReservedItem[], purchasedCount: number): ReservedItemsListPageQuery =>
  ({
    myReservedItems: {
      __typename: 'GetReservedItemsPagedResponse',
      data: items,
      pagination: { totalPages: 1, totalElements: items.length, pageNumber: 1, pageSize: 10 },
      purchasedCount,
    },
  }) as ReservedItemsListPageQuery;

const dataOf = (query: ReservedItemsListPageQuery) =>
  query.myReservedItems.__typename === 'GetReservedItemsPagedResponse' ? query.myReservedItems : undefined;

describe('bulkPurchaseState', () => {
  it('should tell whether none, some or all items are bought', () => {
    expect(bulkPurchaseState([item('a'), item('b')])).toBe('none');
    expect(bulkPurchaseState([item('a', PURCHASED_AT), item('b')])).toBe('some');
    expect(bulkPurchaseState([item('a', PURCHASED_AT), item('b', PURCHASED_AT)])).toBe('all');
  });
});

describe('nextBulkPurchase', () => {
  it('should check only the items still to buy', () => {
    expect(nextBulkPurchase([item('a', PURCHASED_AT), item('b'), item('c')])).toEqual({
      purchased: true,
      itemIds: ['b', 'c'],
    });
  });

  it('should uncheck every item once all are bought', () => {
    expect(nextBulkPurchase([item('a', PURCHASED_AT), item('b', PURCHASED_AT)])).toEqual({
      purchased: false,
      itemIds: ['a', 'b'],
    });
  });
});

describe('snapshotPurchases', () => {
  it('should keep the purchase of the requested items only', () => {
    const query = pageOf([item('a', PURCHASED_AT), item('b'), item('c')], 1);

    expect(snapshotPurchases(query, [itemId('a'), itemId('b')])).toEqual(
      new Map([
        ['a', PURCHASED_AT],
        ['b', null],
      ]),
    );
  });
});

describe('applyPurchaseChanges', () => {
  it('should mark the items, the current user taker and the counter without moving the items', () => {
    const query = pageOf([item('a'), item('b'), item('c', PURCHASED_AT)], 1);

    const result = dataOf(
      applyPurchaseChanges({
        query,
        changes: new Map([
          [itemId('a'), PURCHASED_AT],
          [itemId('b'), PURCHASED_AT],
        ]),
        currentUserId: CURRENT_USER,
      }),
    );

    expect(result?.purchasedCount).toBe(3);
    expect(result?.data.map(row => [row.id, row.purchasedAt])).toEqual([
      ['a', PURCHASED_AT],
      ['b', PURCHASED_AT],
      ['c', PURCHASED_AT],
    ]);
    expect(result?.data[0]?.takers).toEqual([
      { userId: CURRENT_USER, purchasedAt: PURCHASED_AT },
      { userId: CO_TAKER, purchasedAt: null },
    ]);
  });

  it('should decrease the counter when unchecking', () => {
    const query = pageOf([item('a', PURCHASED_AT), item('b', PURCHASED_AT)], 2);

    const result = dataOf(
      applyPurchaseChanges({ query, changes: new Map([[itemId('a'), null]]), currentUserId: CURRENT_USER }),
    );

    expect(result?.purchasedCount).toBe(1);
    expect(result?.data[0]?.purchasedAt).toBeNull();
  });

  it('should not count twice an item that is already in the requested state', () => {
    const query = pageOf([item('a', PURCHASED_AT)], 1);

    const result = dataOf(
      applyPurchaseChanges({
        query,
        changes: new Map([[itemId('a'), '2026-11-25T10:00:00.000Z']]),
        currentUserId: CURRENT_USER,
      }),
    );

    expect(result?.purchasedCount).toBe(1);
  });

  it('should leave a rejected query untouched', () => {
    const query = { myReservedItems: { __typename: 'UnauthorizedRejection' } } as ReservedItemsListPageQuery;

    expect(
      applyPurchaseChanges({ query, changes: new Map([[itemId('a'), PURCHASED_AT]]), currentUserId: CURRENT_USER }),
    ).toBe(query);
  });
});
