import type { RootState } from '../core'

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useSelector } from 'react-redux'

import { LandingPage } from '../components/landing/LandingPage'

const mapAuthState = (state: RootState) => state.auth

export const Route = createFileRoute('/')({
  component: () => {
    const { accessToken } = useSelector(mapAuthState)
    const isLoggedIn = accessToken !== undefined

    if (isLoggedIn) {
      return <Navigate to="/events" replace />
    }

    return <LandingPage />
  },
})
