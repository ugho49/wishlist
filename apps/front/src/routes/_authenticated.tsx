import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AuthenticatedContainerOutlet } from '../components/common/router/outlet/AuthenticatedContainerOutlet'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // Redirect unauthenticated users to login with return URL
    if (!context.isAuthenticated) {
      const search = location.pathname !== '/' ? `?redirectUrl=${encodeURIComponent(location.href)}` : ''
      throw redirect({
        to: '/login',
        search: search ? { redirectUrl: location.href } : undefined,
      })
    }
  },
  component: () => {
    return (
      <AuthenticatedContainerOutlet>
        <Outlet />
      </AuthenticatedContainerOutlet>
    )
  },
})
