import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminPage } from './components/admin/AdminPage'
import { LoginPage } from './components/auth/LoginPage'
import { LogoutPage } from './components/auth/LogoutPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { MaintenancePage } from './components/common/MaintenancePage'
import { AdminEventPage } from './components/event/admin/AdminEventPage'
import { CreateEventPage } from './components/event/CreateEventPage'
import { EditEventPage } from './components/event/EditEventPage'
import { EventListPage } from './components/event/EventListPage'
import { EventPage } from './components/event/EventPage'
import { SecretSantaPage } from './components/secret-santa/SecretSantaPage'
import { AdminUserPage } from './components/user/admin/AdminUserPage'
import { UserProfilePage } from './components/user/UserProfilePage'
import { CreateWishlistPage } from './components/wishlist/CreateWishlistPage'
import { EditWishlistPage } from './components/wishlist/EditWishlistPage'
import { WishlistListPage } from './components/wishlist/WishlistListPage'
import { WishlistPage } from './components/wishlist/WishlistPage'
import { AdminRouteOutlet } from './core/router/outlet/AdminRouteOutlet'
import { PrivateRouteContainerOutlet } from './core/router/outlet/PrivateRouteContainerOutlet'

export const App = () => {
  const flagEnabled = useFeatureFlagEnabled('frontend-maintenance-page-enabled')

  if (flagEnabled) {
    return <MaintenancePage />
  }

  return (
    <Routes>
      <Route path="logout" element={<LogoutPage />} />

      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route path="*" element={<Navigate replace to="/not-found" />} />

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
    </Routes>
  )
}
