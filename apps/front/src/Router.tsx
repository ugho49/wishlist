import type { RootState } from './core'

import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminPage } from './components/admin/AdminPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { RenewForgotPasswordPage } from './components/auth/RenewForgotPasswordPage'
import { AdminRouteGuard } from './components/common/router/guard/AdminRouteGuard'
import { AnonymousRouteGuard } from './components/common/router/guard/AnonymousRouteGuard'
import { AuthenticatedRouteGuard } from './components/common/router/guard/AuthenticatedRouteGuard'
import { AnonymousContainerOutlet } from './components/common/router/outlet/AnonymousContainerOutlet'
import { AuthenticatedContainerOutlet } from './components/common/router/outlet/AuthenticatedContainerOutlet'
import { AdminEventPage } from './components/event/admin/AdminEventPage'
import { CreateEventPage } from './components/event/CreateEventPage'
import { EditEventPage } from './components/event/EditEventPage'
import { EventListPage } from './components/event/EventListPage'
import { EventPage } from './components/event/EventPage'
import { LandingPage } from './components/landing/LandingPage'
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage'
import { TermsOfServicePage } from './components/legal/TermsOfServicePage'
import { WelcomePage } from './components/onboarding/WelcomePage'
import { SecretSantaPage } from './components/secret-santa/SecretSantaPage'
import { AdminUserPage } from './components/user/admin/AdminUserPage'
import { UserProfilePage } from './components/user/UserProfilePage'
import { CreateWishlistPage } from './components/wishlist/CreateWishlistPage'
import { EditWishlistPage } from './components/wishlist/EditWishlistPage'
import { WishlistListPage } from './components/wishlist/WishlistListPage'
import { WishlistPage } from './components/wishlist/WishlistPage'

const mapAuthState = (state: RootState) => state.auth

export const AppRouter = () => {
  const { accessToken } = useSelector(mapAuthState)
  const isLoggedIn = accessToken !== undefined

  return (
    <Routes>
      {isLoggedIn ? (
        <Route path="/" element={<Navigate replace to="/events" />} />
      ) : (
        <Route path="/" element={<LandingPage />} />
      )}

      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />

      <Route element={<AnonymousRouteGuard />}>
        <Route element={<AnonymousContainerOutlet />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/renew" element={<RenewForgotPasswordPage />} />
        </Route>
      </Route>

      <Route element={<AuthenticatedRouteGuard />}>
        <Route path="/welcome" element={<WelcomePage />} />

        <Route element={<AuthenticatedContainerOutlet />}>
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

          <Route path="admin" element={<AdminRouteGuard />}>
            <Route index element={<AdminPage />} />
            <Route path="users/:userId" element={<AdminUserPage />} />
            <Route path="events/:eventId" element={<AdminEventPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
