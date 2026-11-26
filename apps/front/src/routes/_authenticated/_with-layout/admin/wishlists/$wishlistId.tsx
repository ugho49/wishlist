import type { WishlistId } from '@wishlist/common';

import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { AdminWishlistPage, AdminWishlistTab } from '../../../../../components/wishlist/admin/AdminWishlistPage';

export const Route = createFileRoute('/_authenticated/_with-layout/admin/wishlists/$wishlistId')({
  params: {
    parse: params => ({ wishlistId: params.wishlistId as WishlistId }),
  },
  validateSearch: z.object({
    tab: z.enum(AdminWishlistTab).optional().catch(AdminWishlistTab.info).default(AdminWishlistTab.info),
  }),
  component: () => {
    const { wishlistId } = Route.useParams();
    return <AdminWishlistPage wishlistId={wishlistId} />;
  },
});
