import { Box } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

export type CardProps = {
  to?: string;
  onClick?: () => void;
  className?: string;
  sx?: SxProps<Theme>;
};

export const Card = ({ onClick, to, children, className, sx }: PropsWithChildren<CardProps>) => {
  const LinkProps = to ? { component: Link, to } : {};

  return (
    <Box className={clsx('card', (to || onClick) && 'clickable', className)} {...LinkProps} onClick={onClick} sx={sx}>
      {children}
    </Box>
  );
};
