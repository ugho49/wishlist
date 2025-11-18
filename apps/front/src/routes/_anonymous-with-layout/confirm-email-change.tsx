import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { ConfirmEmailChangePage } from '../../components/auth/ConfirmEmailChangePage'

export const Route = createFileRoute('/_anonymous-with-layout/confirm-email-change')({
  component: () => <ConfirmEmailChangePage />,
  validateSearch: z.object({
    email: z.string().email().optional().default(''),
    token: z.string().optional().default(''),
  }),
})
