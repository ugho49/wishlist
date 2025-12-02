import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'

import { PrivacyPolicyPage } from '../components/legal/PrivacyPolicyPage'

export const Route = createFileRoute('/privacy')({
  component: () => (
    <>
      <SEO
        title="Politique de Confidentialité"
        description="Découvrez comment Wishlist collecte, utilise et protège vos données personnelles. Votre vie privée est notre priorité."
        canonical="/privacy"
        indexByRobots
      />
      <PrivacyPolicyPage />
    </>
  ),
})
