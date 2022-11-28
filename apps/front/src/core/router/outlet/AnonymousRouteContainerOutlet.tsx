import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AnonymousRouteContainerOutlet = () => (
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
