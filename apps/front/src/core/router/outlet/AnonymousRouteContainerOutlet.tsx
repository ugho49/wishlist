import { Container, Stack, Theme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { ReactComponent as IconSvg } from '../../../assets/icons/icon.svg';
import { ReactComponent as TextSvg } from '../../../assets/icons/logo_text.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: '64px',
  },
  logo: {
    marginBottom: '25px',
    color: theme.palette.primary.main,
  },
}));

export const AnonymousRouteContainerOutlet = () => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="sm">
      <Stack direction="column" alignItems="center" className={classes.root}>
        <Stack alignItems="center" className={classes.logo}>
          <IconSvg style={{ marginRight: '10px', height: '55px' }} />
          <TextSvg style={{ height: '60px' }} />
        </Stack>
        <Outlet />
      </Stack>
    </Container>
  );
};
