import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { WishlistListPage } from '../../../../components/wishlist/WishlistListPage'

export const Route = createFileRoute('/_authenticated/_with-layout/wishlists/')({
  component: () => <WishlistListPage />,
  validateSearch: z.object({
    page: z.number().optional().catch(1).default(1),
  }),
})
