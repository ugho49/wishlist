import React, { PropsWithChildren } from 'react';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    fontWeight: 300,
    fontSize: '1.6rem',
    letterSpacing: '.05em',
    textAlign: 'center',
    '&:not(.smallMarginBottom)': {
      [theme.breakpoints.up('sm')]: {
        marginBottom: '60px',
      },
    },
  },
}));

export type TitleProps = {
  smallMarginBottom?: boolean;
};

export const Title = ({ children, smallMarginBottom = false }: PropsWithChildren<TitleProps>) => {
  const classes = useStyles();

  return <h1 className={clsx(classes.title, smallMarginBottom && 'smallMarginBottom')}>{children}</h1>;
};
