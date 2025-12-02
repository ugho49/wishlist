import type { RootState } from '../core'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { createRootRoute, Navigate, Outlet } from '@tanstack/react-router'
import { FeatureFlags } from '@wishlist/common'
import { useLDClient } from 'launchdarkly-react-client-sdk'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { MaintenancePage } from '../components/common/MaintenancePage'
import { ScrollToTop } from '../components/common/ScrollToTop'
import { SEO } from '../components/SEO'
import { AxiosInterceptor } from '../core/router/AxiosInterceptor'
import { environment } from '../environment'
import { useFeatureFlag } from '../hooks/useFeatureFlag'

const mapUserProfileState = (state: RootState) => state.userProfile

export const Route = createRootRoute({
  notFoundComponent: () => <Navigate to="/" />,
  component: () => {
    const maintenancePageEnabled = useFeatureFlag(FeatureFlags.FRONTEND_MAINTENANCE_PAGE_ENABLED)
    const ldClient = useLDClient()
    const userProfile = useSelector(mapUserProfileState)

    useEffect(() => {
      if (userProfile.isUserLoaded) {
        ldClient?.identify({
          kind: 'user',
          key: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
        })
      } else {
        ldClient?.identify({ anonymous: true })
      }
    }, [userProfile, ldClient])

    if (maintenancePageEnabled) return <MaintenancePage />

    return (
      <>
        <SEO indexByRobots={false} />
        <ScrollToTop />
        <AxiosInterceptor />
        <GoogleOAuthProvider clientId={environment.googleClientId}>
          <Outlet />
        </GoogleOAuthProvider>
      </>
    )
  },
})
