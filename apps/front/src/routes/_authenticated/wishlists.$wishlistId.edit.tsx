import { createFileRoute } from '@tanstack/react-router'

import { EditWishlistPage } from '../../components/wishlist/EditWishlistPage'

export const Route = createFileRoute('/_authenticated/wishlists/$wishlistId/edit')({
  component: EditWishlistPage,
})
