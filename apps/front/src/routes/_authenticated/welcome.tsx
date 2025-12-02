import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'

import { WelcomePage } from '../../components/onboarding/WelcomePage'

export const Route = createFileRoute('/_authenticated/welcome')({
  component: () => (
    <>
      <SEO
        title="Bienvenue"
        description="Bienvenue sur Wishlist. Nous sommes ravis de vous accueillir sur notre plateforme."
        canonical="/welcome"
      />
      <WelcomePage />
    </>
  ),
})
