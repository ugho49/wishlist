import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { store } from '../../core'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: () => {
    // Check if user is admin
    const user = store.getState().auth.user
    const isAdmin = user?.isAdmin || false

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: () => <Outlet />,
})
