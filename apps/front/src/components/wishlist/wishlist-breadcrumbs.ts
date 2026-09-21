import type { EventId, WishlistId } from '@wishlist/common';
import type { PageBreadcrumb } from '../common/PageBreadcrumbs';

type WishlistTrailSource = {
  id: WishlistId;
  title: string;
  events: Array<{ id: EventId; title: string }>;
};

export const wishlistBreadcrumbs = (
  wishlist: WishlistTrailSource | undefined,
  fromEvent: EventId | undefined,
  current: 'wishlist' | 'edit',
): PageBreadcrumb[] => {
  const event = fromEvent && wishlist ? wishlist.events.find(item => item.id === fromEvent) : undefined;
  const crumbs: PageBreadcrumb[] = event
    ? [
        { label: 'Évènements', to: '/events' },
        { label: event.title, to: '/events/$eventId', params: { eventId: event.id } },
      ]
    : [{ label: 'Mes listes', to: '/wishlists' }];

  if (current === 'edit') {
    if (wishlist) {
      crumbs.push({
        label: wishlist.title,
        to: '/wishlists/$wishlistId',
        params: { wishlistId: wishlist.id },
        ...(fromEvent ? { search: { fromEvent } } : {}),
      });
    }
    crumbs.push({ label: 'Modifier' });
    return crumbs;
  }

  crumbs.push({ label: wishlist?.title ?? 'Liste' });
  return crumbs;
};
