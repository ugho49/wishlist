import React, { PropsWithChildren } from 'react';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    fontWeight: 300,
    fontSize: '1.6rem',
    letterSpacing: '.05em',
    textAlign: 'center',
  },
}));

export const Title = ({ children }: PropsWithChildren) => {
  const classes = useStyles();

  return <h1 className={classes.title}>{children}</h1>;
};
