import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { LoginPage } from '../../components/auth/LoginPage'

export const Route = createFileRoute('/_anonymous-with-layout/login')({
  validateSearch: z.object({
    redirectUrl: z.string().optional().default('/'),
    email: z.email().catch('').optional(),
  }),
  component: () => (
    <>
      <SEO
        title="Connexion"
        description="Connectez-vous à votre compte Wishlist pour gérer vos listes de souhaits et partager vos envies avec vos proches."
        canonical="/login"
        indexByRobots
      />
      <LoginPage />
    </>
  ),
})
