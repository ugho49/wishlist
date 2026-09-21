import type { WishlistItem } from './wishlist.types';

import { applySort, SortType } from './WishlistFilterAndSortItems';

const item = (overrides: Pick<WishlistItem, 'id' | 'name'> & Partial<WishlistItem>): WishlistItem =>
  ({
    createdAt: '2024-01-01T00:00:00.000Z',
    score: null,
    takers: [],
    isSuggested: false,
    ...overrides,
  }) as WishlistItem;

describe('applySort', () => {
  const sameDate = '2024-06-01T12:00:00.000Z';
  const older = item({ id: 'item-b', name: 'Vélo', createdAt: sameDate });
  const newer = item({ id: 'item-a', name: 'Appareil photo', createdAt: sameDate });

  it('keeps a stable order when createdAt is identical, whatever the input order', () => {
    const ascending = [newer, older].toSorted((a, b) => applySort(a, b, SortType.CREATED_AT_DESC));
    const descending = [older, newer].toSorted((a, b) => applySort(a, b, SortType.CREATED_AT_DESC));

    expect(ascending.map(entry => entry.id)).toEqual(['item-a', 'item-b']);
    expect(descending.map(entry => entry.id)).toEqual(['item-a', 'item-b']);
  });

  it('does not move an item when its name changes under the creation-date sort', () => {
    const renamed = { ...older, name: 'AAAA' };
    const sorted = [newer, renamed].toSorted((a, b) => applySort(a, b, SortType.CREATED_AT_DESC));

    expect(sorted.map(entry => entry.id)).toEqual(['item-a', 'item-b']);
  });

  it('still orders by name when that sort is selected', () => {
    const sorted = [older, newer].toSorted((a, b) => applySort(a, b, SortType.NAME_ASC));

    expect(sorted.map(entry => entry.name)).toEqual(['Appareil photo', 'Vélo']);
  });
});
