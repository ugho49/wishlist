import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'

import { ForgotPasswordPage } from '../../../components/auth/ForgotPasswordPage'

export const Route = createFileRoute('/_anonymous-with-layout/forgot-password/')({
  component: () => (
    <>
      <SEO
        title="Mot de passe oublié"
        description="Réinitialisez votre mot de passe pour accéder à votre compte Wishlist."
        canonical="/forgot-password"
        indexByRobots
      />
      <ForgotPasswordPage />
    </>
  ),
})
