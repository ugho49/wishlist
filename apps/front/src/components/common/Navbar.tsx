import React, { useCallback } from 'react';
import { logout } from '../../core/store/features';
import { useDispatch } from 'react-redux';
import { AppBar, Box, Button, Container, IconButton, Stack, Theme, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useHistoryStack, useToast } from '@wishlist/common-front';
import { ReactComponent as IconSvg } from '../../assets/icons/icon.svg';
import { ReactComponent as TextSvg } from '../../assets/icons/logo_text.svg';
import { makeStyles } from '@mui/styles';
import { Link, useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.secondary.main,
  },
  leftNavbar: {
    display: 'flex',
    flexBasis: '20%',
    marginLeft: '-15px',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
}));

const GoBack = () => {
  const navigate = useNavigate();
  const { history } = useHistoryStack();

  if (history.length === 0) {
    return null;
  }

  return (
    <IconButton color="inherit" onClick={() => navigate(-1)}>
      <ArrowBackIcon />
    </IconButton>
  );
};

export const Navbar = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const handleLogout = useCallback(() => {
    addToast({ message: 'A bientôt 👋', variant: 'default' });
    logout(dispatch);
  }, [dispatch]);

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar>
          <Box className={classes.leftNavbar}>
            <GoBack />
          </Box>

          <Stack alignItems="center" direction="row" className={classes.logo}>
            <Link to="/" className={classes.logoLink}>
              <IconSvg style={{ marginRight: '10px', height: '24px' }} />
              <TextSvg style={{ height: '44px' }} />
            </Link>
          </Stack>

          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              <Typography variant="inherit">Déconnexion</Typography>
            </Button>
          </Box>

          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              flexBasis: '20%',
              marginRight: '-15px',
              justifyContent: 'flex-end',
            }}
          >
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
