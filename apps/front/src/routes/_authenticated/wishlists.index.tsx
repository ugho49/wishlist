import { createFileRoute } from '@tanstack/react-router'

import { WishlistListPage } from '../../components/wishlist/WishlistListPage'

export const Route = createFileRoute('/_authenticated/wishlists/')({
  component: WishlistListPage,
})
