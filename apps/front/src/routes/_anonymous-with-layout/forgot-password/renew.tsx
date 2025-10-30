import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { RenewForgotPasswordPage } from '../../../components/auth/RenewForgotPasswordPage'

export const Route = createFileRoute('/_anonymous-with-layout/forgot-password/renew')({
  component: () => <RenewForgotPasswordPage />,
  validateSearch: z.object({
    email: z.email().optional().default(''),
    token: z.string().optional().default(''),
  }),
})
