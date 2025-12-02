import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'

import { TermsOfServicePage } from '../components/legal/TermsOfServicePage'

export const Route = createFileRoute('/terms')({
  component: () => (
    <>
      <SEO
        title="Conditions Générales d'Utilisation"
        description="Consultez les conditions d'utilisation de Wishlist. Découvrez vos droits et obligations lors de l'utilisation de notre service."
        canonical="/terms"
        indexByRobots
      />
      <TermsOfServicePage />
    </>
  ),
})
