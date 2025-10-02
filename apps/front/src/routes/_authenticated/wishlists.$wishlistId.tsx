import { createFileRoute } from '@tanstack/react-router'

import { WishlistPage } from '../../components/wishlist/WishlistPage'

export const Route = createFileRoute('/_authenticated/wishlists/$wishlistId')({
  component: WishlistPage,
})
