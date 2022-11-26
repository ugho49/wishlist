import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Box, Container } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { useDispatch, useSelector } from 'react-redux';
import { useApi } from '@wishlist/common-front';
import { RootState } from './core';
import { useEffect } from 'react';
import { wishlistApiRef } from './core/api/wishlist.api';
import { Navbar } from './components/Navbar';

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
    <Navbar />
    <Box component="main">
      <Outlet />
    </Box>
  </>
);

const mapState = (state: RootState) => ({ token: state.auth.token });

export const App = () => {
  const { token } = useSelector(mapState);
  const isLoggedIn = token !== undefined;
  const api = useApi(wishlistApiRef);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn) {
      // api.getUserInfos().then((res) => dispatch(setUser(res.data)));
      // dispatch(setLoadBabies(true));
      // api
      //   .getAllMyBabies()
      //   .then((res) => dispatch(setBabies(res.data)))
      //   .finally(() => dispatch(setLoadBabies(false)));
    }
  }, [token]);

  return (
    <Routes>
      {!isLoggedIn && (
        <>
          <Route path="/" element={<Navigate replace to="/login" />} />

          <Route element={<AnonymousRouteContainerOutlet />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </>
      )}

      {isLoggedIn && (
        <Route element={<PrivateRouteContainerOutlet />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      )}

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
