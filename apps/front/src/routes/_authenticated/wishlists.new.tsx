import { createFileRoute } from '@tanstack/react-router'

import { CreateWishlistPage } from '../../components/wishlist/CreateWishlistPage'

export const Route = createFileRoute('/_authenticated/wishlists/new')({
  component: CreateWishlistPage,
})
