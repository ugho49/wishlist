import { createFileRoute } from '@tanstack/react-router'

import { RenewForgotPasswordPage } from '../../components/auth/RenewForgotPasswordPage'

export const Route = createFileRoute('/_anonymous/forgot-password/renew')({
  component: RenewForgotPasswordPage,
})
