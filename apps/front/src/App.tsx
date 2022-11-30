import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventListPage } from './pages/EventListPage';
import { useSelector } from 'react-redux';
import { RootState } from './core';
import { UserProfilePage } from './pages/UserProfilePage';
import { WishlistListPage } from './pages/WishlistListPage';
import { AnonymousRouteContainerOutlet } from './core/router/outlet/AnonymousRouteContainerOutlet';
import { PrivateRouteContainerOutlet } from './core/router/outlet/PrivateRouteContainerOutlet';
import { AdminRouteOutlet } from './core/router/outlet/AdminRouteOutlet';
import { AdminPage } from './pages/AdminPage';
import { WishlistPage } from './pages/WishlistPage';

const mapState = (state: RootState) => ({ accessToken: state.auth.accessToken });

export const App = () => {
  const { accessToken } = useSelector(mapState);
  const isLoggedIn = accessToken !== undefined;

  return (
    <Routes>
      {!isLoggedIn && (
        <>
          <Route path="/" element={<Navigate replace to="/login" />} />

          <Route element={<AnonymousRouteContainerOutlet />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            {/*<Route path="/forgot-password" element={<ForgotPassword />} />*/}
            {/*<Route path="/forgot-password/renew" element={<RenewForgotPassword />} />*/}
          </Route>
        </>
      )}

      {isLoggedIn && (
        <Route element={<PrivateRouteContainerOutlet />}>
          <Route path="/" element={<Navigate replace to="/events" />} />

          <Route path="user">
            <Route path="profile" element={<UserProfilePage />} />
          </Route>

          <Route path="events">
            <Route index element={<EventListPage />} />
            {/*<Route path="new" element={<CreateEvent />} />*/}
            {/*<Route path=":eventId" element={<EventDetails />} />*/}
            {/*<Route path=":eventId/edit" element={<EditEvent />} />*/}
          </Route>

          <Route path="wishlists">
            <Route index element={<WishlistListPage />} />
            {/*<Route path="new" element={<WishlistForm />} />*/}
            <Route path=":wishlistId" element={<WishlistPage />} />
            {/*<Route path=":wishlistId/edit" element={<EditWishlist />} />*/}
          </Route>

          <Route path="admin" element={<AdminRouteOutlet />}>
            <Route index element={<AdminPage />} />
            {/*<Route path="users" element={<AdminListUsers />} />*/}
            {/*<Route path="users/:userId" element={<AdminEditUser />} />*/}
            {/*<Route path="events" element={<AdminListEvents />} />*/}
            {/*<Route path="events/:eventId" element={<AdminEditEvent />} />*/}
          </Route>
        </Route>
      )}

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
