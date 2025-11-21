import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { ConfirmEmailChangePage } from '../components/auth/ConfirmEmailChangePage'

export const Route = createFileRoute('/confirm-email-change')({
  component: () => {
    const { email, token } = Route.useSearch()
    return <ConfirmEmailChangePage email={email} token={token} />
  },
  validateSearch: z.object({
    email: z.email().optional().default(''),
    token: z.string().optional().default(''),
  }),
})
