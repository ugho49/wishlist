import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Box, Container } from '@mui/material';
import { EventListPage } from './pages/EventListPage';
import { useSelector } from 'react-redux';
import { RootState } from './core';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { UserProfilePage } from './pages/UserProfilePage';
import { WishlistListPage } from './pages/WishlistListPage';

const AnonymousRouteContainerOutlet = () => (
  <Container component="main" maxWidth="xs">
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Outlet />
    </Box>
  </Container>
);

const PrivateRouteContainerOutlet = () => (
  <>
    <Box
      id="backdrop"
      sx={{
        backgroundColor: '#fafafa',
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
    <Navbar />
    <Box component="main">
      <Container component="section" maxWidth="xs" sx={{ mt: 2, mb: '80px' }}>
        <Outlet />
      </Container>
    </Box>
    <Footer />
  </>
);

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
            {/*TODO -->*/}
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
            {/*<Route path=":wishlistId" element={<WishlistDetails />} />*/}
            {/*<Route path=":wishlistId/edit" element={<EditWishlist />} />*/}
          </Route>

          {/*<Route path="admin" element={<AdminRouteOutlet />}>*/}
          {/*  <Route index element={<Admin />} />*/}
          {/*  <Route path="users" element={<AdminListUsers />} />*/}
          {/*  <Route path="users/:userId" element={<AdminEditUser />} />*/}
          {/*  <Route path="events" element={<AdminListEvents />} />*/}
          {/*  <Route path="events/:eventId" element={<AdminEditEvent />} />*/}
          {/*</Route>*/}
        </Route>
      )}

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
