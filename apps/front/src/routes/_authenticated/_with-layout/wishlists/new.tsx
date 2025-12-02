import type { EventId } from '@wishlist/common'

import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { CreateWishlistPage } from '../../../../components/wishlist/CreateWishlistPage'

export const Route = createFileRoute('/_authenticated/_with-layout/wishlists/new')({
  component: () => (
    <>
      <SEO
        title="Créer une liste de souhaits"
        description="Créez une nouvelle liste de souhaits et partagez vos envies avec vos proches."
        canonical="/wishlists/new"
      />
      <CreateWishlistPage />
    </>
  ),
  validateSearch: z.object({
    fromEvent: z.optional(z.custom<EventId>()),
  }),
})
