import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthService } from '../core/services/auth.service'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const authService = new AuthService()

    if (!authService.accessTokenService.isLocalStorageTokenValid()) {
      throw redirect({ to: '/login', search: { redirectUrl: location.href } })
    }
  },
})
