import { Box, Container, containerClasses, Theme } from '@mui/material';
import { Navbar } from '../../../components/common/Navbar';
import { Outlet } from 'react-router-dom';
import { Footer } from '../../../components/common/Footer';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    backgroundColor: theme.palette.background.default,
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  container: {
    [`&.${containerClasses.root}`]: {
      marginTop: 2,
      marginBottom: '130px',
    },
  },
}));

export const PrivateRouteContainerOutlet = () => {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.backdrop} />
      <Navbar />
      <Box component="main">
        <Container fixed component="section" maxWidth="lg" className={classes.container}>
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </>
  );
};
