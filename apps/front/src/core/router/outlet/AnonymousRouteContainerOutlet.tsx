import { Container, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AnonymousRouteContainerOutlet = () => (
  <Container component="main" maxWidth="xs">
    <Stack direction="column" alignItems="center" sx={{ marginTop: 8 }}>
      <Outlet />
    </Stack>
  </Container>
);
