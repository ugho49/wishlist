import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AnonymousContainerOutlet } from '../components/common/router/outlet/AnonymousContainerOutlet'

export const Route = createFileRoute('/_anonymous')({
  beforeLoad: ({ context, location }) => {
    // Redirect authenticated users away from anonymous routes
    if (context.isAuthenticated) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: () => {
    return (
      <AnonymousContainerOutlet>
        <Outlet />
      </AnonymousContainerOutlet>
    )
  },
})
