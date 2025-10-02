import { createFileRoute } from '@tanstack/react-router'

import { RegisterPage } from '../../components/auth/RegisterPage'

export const Route = createFileRoute('/_anonymous/register')({
  component: RegisterPage,
})
