import React from 'react';
import { logout } from '../core/store/features';
import { useDispatch } from 'react-redux';
import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Typography, useTheme } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { RouterLink } from '@wishlist/common-front';
import { ReactComponent as IconSvg } from '../assets/icon.svg';
import { ReactComponent as TextSvg } from '../assets/logo_text.svg';

export const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleLogout = () => {
    // TODO: Toast "Hope to see you soon"
    logout(dispatch);
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar>
          <Stack
            to="/"
            component={RouterLink}
            alignItems="center"
            direction="row"
            flexGrow={1}
            color={theme.palette.secondary.main}
          >
            <IconSvg style={{ marginRight: '10px', height: '24px' }} />
            <TextSvg style={{ height: '44px' }} />
          </Stack>

          <Box sx={{ flexGrow: 0 }}>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <Typography variant="inherit">Déconnexion</Typography>
            </Button>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ display: { xs: 'flex', sm: 'none' }, marginRight: '-15px' }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
