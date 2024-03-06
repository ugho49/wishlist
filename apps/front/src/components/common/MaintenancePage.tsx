import React from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

// Styles for the component
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  message: {
    textAlign: 'center',
  },
  icon: {
    marginBottom: theme.spacing(2),
  },
}));

export const MaintenancePage = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ConstructionIcon className={classes.icon} sx={{ fontSize: 72 }} />
      <div className={classes.message}>
        <Typography variant="h4" gutterBottom>
          Site en maintenance
        </Typography>
        <Typography variant="body1">Nous sommes désolés pour le dérangement. Veuillez réessayer plus tard.</Typography>
      </div>
    </div>
  );
};
