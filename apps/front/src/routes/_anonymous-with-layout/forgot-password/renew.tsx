import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { RenewForgotPasswordPage } from '../../../components/auth/RenewForgotPasswordPage'

export const Route = createFileRoute('/_anonymous-with-layout/forgot-password/renew')({
  validateSearch: z.object({
    email: z.email().optional().default(''),
    token: z.string().optional().default(''),
  }),
  component: () => (
    <>
      <SEO
        title="Réinitialisation de mot de passe"
        description="Réinitialisez votre mot de passe pour accéder à votre compte Wishlist."
        canonical="/forgot-password/renew"
      />
      <RenewForgotPasswordPage />
    </>
  ),
})
