import { Box, Container, containerClasses } from '@mui/material';
import { Navbar } from '../../../components/common/Navbar';
import { Outlet } from 'react-router-dom';
import { Footer } from '../../../components/common/Footer';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
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
