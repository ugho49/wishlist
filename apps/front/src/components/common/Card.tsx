import { Box } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export type CardProps = {
  to?: string;
  onClick?: () => void;
  className?: string;
  sx?: SxProps<Theme>;
  variant?: 'outlined' | 'contained';
};

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    padding: '16px',
    [theme.breakpoints.up('sm')]: {
      padding: '24px',
    },
  },
}));

export const Card = ({ onClick, to, children, className, sx, variant = 'contained' }: PropsWithChildren<CardProps>) => {
  const LinkProps = to ? { component: Link, to } : {};
  const classes = useStyles();

  return (
    <Box
      className={clsx(
        classes.card,
        variant === 'contained' && 'card',
        variant === 'outlined' && 'card-outlined',
        (to || onClick) && 'clickable',
        className
      )}
      {...LinkProps}
      onClick={onClick}
      sx={sx}
    >
      {children}
    </Box>
  );
};
