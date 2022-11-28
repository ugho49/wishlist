import { Box, Container } from '@mui/material';
import { Navbar } from '../../../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Footer } from '../../../components/Footer';

export const PrivateRouteContainerOutlet = () => (
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
      <Container fixed component="section" maxWidth="lg" sx={{ mt: 2, mb: '80px' }}>
        <Outlet />
      </Container>
    </Box>
    <Footer />
  </>
);
