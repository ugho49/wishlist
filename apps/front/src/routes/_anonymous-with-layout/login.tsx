import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { LoginPage } from '../../components/auth/LoginPage'

export const Route = createFileRoute('/_anonymous-with-layout/login')({
  component: () => <LoginPage />,
  validateSearch: z.object({
    redirectUrl: z.string().optional().default('/'),
    email: z.email().catch('').optional(),
  }),
})
