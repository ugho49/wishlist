import type { RootState } from './core'

import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminPage } from './components/admin/AdminPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { RenewForgotPasswordPage } from './components/auth/RenewForgotPasswordPage'
import { MaintenancePage } from './components/common/MaintenancePage'
import { AdminEventPage } from './components/event/admin/AdminEventPage'
import { CreateEventPage } from './components/event/CreateEventPage'
import { EditEventPage } from './components/event/EditEventPage'
import { EventListPage } from './components/event/EventListPage'
import { EventPage } from './components/event/EventPage'
import { LandingPage } from './components/landing/LandingPage'
import { SecretSantaPage } from './components/secret-santa/SecretSantaPage'
import { AdminUserPage } from './components/user/admin/AdminUserPage'
import { UserProfilePage } from './components/user/UserProfilePage'
import { CreateWishlistPage } from './components/wishlist/CreateWishlistPage'
import { EditWishlistPage } from './components/wishlist/EditWishlistPage'
import { WishlistListPage } from './components/wishlist/WishlistListPage'
import { WishlistPage } from './components/wishlist/WishlistPage'
import { NavigateToAuthenticatedWithContext } from './core/router/NavigateToAuthenticatedWithContext'
import { AdminRouteOutlet } from './core/router/outlet/AdminRouteOutlet'
import { AnonymousRouteContainerOutlet } from './core/router/outlet/AnonymousRouteContainerOutlet'
import { PrivateRouteContainerOutlet } from './core/router/outlet/PrivateRouteContainerOutlet'

const mapAuthState = (state: RootState) => state.auth

export const App = () => {
  const { accessToken } = useSelector(mapAuthState)
  const isLoggedIn = accessToken !== undefined
  const flagEnabled = useFeatureFlagEnabled('frontend-maintenance-page-enabled')

  if (flagEnabled) {
    return <MaintenancePage />
  }

  return (
    <Routes>
      {!isLoggedIn && (
        <>
          <Route path="/" element={<LandingPage />} />

          <Route element={<AnonymousRouteContainerOutlet />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/renew" element={<RenewForgotPasswordPage />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </>
      )}

      {isLoggedIn && (
        <>
          <Route path="*" element={<NavigateToAuthenticatedWithContext />} />

          <Route element={<PrivateRouteContainerOutlet />}>
            <Route path="/" element={<Navigate replace to="/events" />} />

            <Route path="user">
              <Route path="profile" element={<UserProfilePage />} />
            </Route>

            <Route path="events">
              <Route index element={<EventListPage />} />
              <Route path="new" element={<CreateEventPage />} />
              <Route path=":eventId" element={<EventPage />} />
              <Route path=":eventId/edit" element={<EditEventPage />} />
              <Route path=":eventId/secret-santa" element={<SecretSantaPage />} />
            </Route>

            <Route path="wishlists">
              <Route index element={<WishlistListPage />} />
              <Route path="new" element={<CreateWishlistPage />} />
              <Route path=":wishlistId" element={<WishlistPage />} />
              <Route path=":wishlistId/edit" element={<EditWishlistPage />} />
            </Route>

            <Route path="admin" element={<AdminRouteOutlet />}>
              <Route index element={<AdminPage />} />
              <Route path="users/:userId" element={<AdminUserPage />} />
              <Route path="events/:eventId" element={<AdminEventPage />} />
            </Route>
          </Route>
        </>
      )}
    </Routes>
  )
}
