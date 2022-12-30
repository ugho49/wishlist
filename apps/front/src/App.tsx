import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { EventListPage } from './components/event/EventListPage';
import { useSelector } from 'react-redux';
import { RootState } from './core';
import { UserProfilePage } from './components/user/UserProfilePage';
import { WishlistListPage } from './components/wishlist/WishlistListPage';
import { AnonymousRouteContainerOutlet } from './core/router/outlet/AnonymousRouteContainerOutlet';
import { PrivateRouteContainerOutlet } from './core/router/outlet/PrivateRouteContainerOutlet';
import { AdminRouteOutlet } from './core/router/outlet/AdminRouteOutlet';
import { AdminPage } from './components/admin/AdminPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { EventPage } from './components/event/EventPage';
import { CreateEventPage } from './components/event/CreateEventPage';
import { CreateWishlistPage } from './components/wishlist/CreateWishlistPage';
import { EditWishlistPage } from './components/wishlist/EditWishlistPage';
import { EditEventPage } from './components/event/EditEventPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { RenewForgotPasswordPage } from './components/auth/RenewForgotPasswordPage';
import { NavigateToLoginWithContext } from './core/router/NavigateToLoginWithContext';
import { NavigateToAuthenticatedWithContext } from './core/router/NavigateToAuthenticatedWithContext';
import { AdminEditUserPage } from './components/user/admin/AdminEditUserPage';

const mapState = (state: RootState) => ({ accessToken: state.auth.accessToken });

export const App = () => {
  const { accessToken } = useSelector(mapState);
  const isLoggedIn = accessToken !== undefined;

  return (
    <Routes>
      {!isLoggedIn && (
        <>
          <Route path="*" element={<NavigateToLoginWithContext />} />

          <Route element={<AnonymousRouteContainerOutlet />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/renew" element={<RenewForgotPasswordPage />} />
          </Route>
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
            </Route>

            <Route path="wishlists">
              <Route index element={<WishlistListPage />} />
              <Route path="new" element={<CreateWishlistPage />} />
              <Route path=":wishlistId" element={<WishlistPage />} />
              <Route path=":wishlistId/edit" element={<EditWishlistPage />} />
            </Route>

            <Route path="admin" element={<AdminRouteOutlet />}>
              <Route index element={<AdminPage />} />
              <Route path="users/:userId" element={<AdminEditUserPage />} />
              {/*<Route path="events/:eventId" element={<AdminEditEvent />} />*/}
            </Route>
          </Route>
        </>
      )}
    </Routes>
  );
};
