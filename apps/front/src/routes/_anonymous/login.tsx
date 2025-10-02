import { createFileRoute } from '@tanstack/react-router'

import { LoginPage } from '../../components/auth/LoginPage'

export const Route = createFileRoute('/_anonymous/login')({
  component: LoginPage,
})
