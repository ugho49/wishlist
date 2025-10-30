import { createFileRoute } from '@tanstack/react-router'

import { ForgotPasswordPage } from '../../../components/auth/ForgotPasswordPage'

export const Route = createFileRoute('/_anonymous-with-layout/forgot-password/')({
  component: () => <ForgotPasswordPage />,
})
