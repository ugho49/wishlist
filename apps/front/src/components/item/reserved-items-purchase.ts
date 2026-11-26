import type { ItemId } from '@wishlist/common';
import type { ReservedItemsListPageQuery } from '../../gql';

type ReservedItemsPage = Extract<
  ReservedItemsListPageQuery['myReservedItems'],
  { __typename: 'GetReservedItemsPagedResponse' }
>;

export type ReservedItem = ReservedItemsPage['data'][number];

/** Purchase date of the current user for each changed item; `null` when the item is no longer bought. */
export type PurchaseChanges = ReadonlyMap<ItemId, string | null>;

export type BulkPurchaseState = 'none' | 'some' | 'all';

export const isPurchased = (item: Pick<ReservedItem, 'purchasedAt'>): boolean => item.purchasedAt != null;

export const bulkPurchaseState = (items: readonly Pick<ReservedItem, 'purchasedAt'>[]): BulkPurchaseState => {
  const purchased = items.filter(isPurchased).length;
  if (purchased === 0) return 'none';
  return purchased === items.length ? 'all' : 'some';
};

/**
 * What the "check all" box does on a page: uncheck everything once all is bought,
 * otherwise check only what is still to buy.
 */
export const nextBulkPurchase = (items: readonly ReservedItem[]): { purchased: boolean; itemIds: ItemId[] } => {
  if (bulkPurchaseState(items) === 'all') {
    return { purchased: false, itemIds: items.map(item => item.id) };
  }

  return { purchased: true, itemIds: items.filter(item => !isPurchased(item)).map(item => item.id) };
};

/** Current purchase state of the given items, to roll back an optimistic update. */
export const snapshotPurchases = (query: ReservedItemsListPageQuery, itemIds: readonly ItemId[]): PurchaseChanges => {
  const page = query.myReservedItems;
  if (page.__typename !== 'GetReservedItemsPagedResponse') return new Map();

  const wanted = new Set(itemIds);
  return new Map(page.data.filter(item => wanted.has(item.id)).map(item => [item.id, item.purchasedAt ?? null]));
};

/**
 * Writes purchase changes of the current user into a cached page, and keeps `purchasedCount` in step.
 * Items keep their position: the list only reorders on the next fetch.
 */
export const applyPurchaseChanges = (params: {
  query: ReservedItemsListPageQuery;
  changes: PurchaseChanges;
  currentUserId: string | undefined;
}): ReservedItemsListPageQuery => {
  const { query, changes, currentUserId } = params;
  const page = query.myReservedItems;
  if (page.__typename !== 'GetReservedItemsPagedResponse' || changes.size === 0) return query;

  let purchasedDelta = 0;
  const data = page.data.map(item => {
    const purchasedAt = changes.get(item.id);
    if (purchasedAt === undefined) return item;

    purchasedDelta += Number(purchasedAt !== null) - Number(isPurchased(item));
    return {
      ...item,
      purchasedAt,
      takers: item.takers.map(taker => (taker.userId === currentUserId ? { ...taker, purchasedAt } : taker)),
    };
  });

  return {
    ...query,
    myReservedItems: { ...page, data, purchasedCount: page.purchasedCount + purchasedDelta },
  };
};
