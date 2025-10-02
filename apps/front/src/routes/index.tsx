import { createFileRoute, redirect } from '@tanstack/react-router'

import { LandingPage } from '../components/landing/LandingPage'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // Redirect authenticated users to events page
    if (context.isAuthenticated) {
      throw redirect({ to: '/events' })
    }
  },
  component: LandingPage,
})
