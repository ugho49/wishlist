import type { EventId, WishlistId } from '@wishlist/common';

import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { EditWishlistPage, TabValues } from '../../../../../components/wishlist/EditWishlistPage';

export const Route = createFileRoute('/_authenticated/_with-layout/wishlists/$wishlistId/edit')({
  params: {
    parse: params => ({ wishlistId: params.wishlistId as WishlistId }),
  },
  validateSearch: z.object({
    tab: z.enum(TabValues).optional().catch(TabValues.informations).default(TabValues.informations),
    fromEvent: z.optional(z.custom<EventId>()),
  }),
  component: () => {
    const { wishlistId } = Route.useParams();
    return <EditWishlistPage wishlistId={wishlistId} />;
  },
});
