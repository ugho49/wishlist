import React, { useState } from 'react';
import { logout } from '../core/store/features';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { RouterLink } from '@wishlist/common-front';
import { RootState } from '../core';

const mapState = (state: RootState) => ({ user: state.auth.user });

export const Navbar = () => {
  const { user } = useSelector(mapState);
  const dispatch = useDispatch();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    // TODO: Toast "Hope to see you soon"
    logout(dispatch);
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: { xs: 'flex' },
              alignItems: 'center',
              flexGrow: 0,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <img style={{ margin: '10px', height: '2.2rem' }} alt="" src="/logo.png" />
            <Typography variant="h5" noWrap>
              Wishlist
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'flex' }, flexGrow: 1 }} />

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {/*<Avatar alt={`${user?.firstname} ${user?.lastname}`} />*/}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem component={RouterLink} to="/profile">
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
