import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { WishlistListPage } from '../../../../components/wishlist/WishlistListPage'

export const Route = createFileRoute('/_authenticated/_with-layout/wishlists/')({
  component: () => (
    <>
      <SEO
        title="Mes listes de souhaits"
        description="Gérez toutes vos listes de souhaits pour vos différents événements."
        canonical="/wishlists"
      />
      <WishlistListPage />
    </>
  ),
  validateSearch: z.object({
    page: z.number().optional().catch(1).default(1),
  }),
})
