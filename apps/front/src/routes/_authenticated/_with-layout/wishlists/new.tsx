import type { EventId } from '@wishlist/common'

import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { CreateWishlistPage } from '../../../../components/wishlist/CreateWishlistPage'

export const Route = createFileRoute('/_authenticated/_with-layout/wishlists/new')({
  component: () => <CreateWishlistPage />,
  validateSearch: z.object({
    fromEvent: z.optional(z.custom<EventId>()),
  }),
})
