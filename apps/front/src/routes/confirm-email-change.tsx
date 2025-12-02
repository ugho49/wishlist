import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { ConfirmEmailChangePage } from '../components/auth/ConfirmEmailChangePage'

export const Route = createFileRoute('/confirm-email-change')({
  validateSearch: z.object({
    email: z.email().optional().default(''),
    token: z.string().optional().default(''),
  }),
  component: () => {
    const { email, token } = Route.useSearch()
    return (
      <>
        <SEO title="Confirmation de changement d'email" canonical="/confirm-email-change" />
        <ConfirmEmailChangePage email={email} token={token} />
      </>
    )
  },
})
