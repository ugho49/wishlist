import React from 'react';
import { Box, Fab, fabClasses } from '@mui/material';
import { RouterLink } from '@wishlist/common-front';
import { makeStyles } from '@mui/styles';
import { FabTypeMap } from '@mui/material/Fab/Fab';

const useStyles = makeStyles(() => ({
  fab: {
    [`&.${fabClasses.root}`]: {
      position: 'fixed',
      bottom: 72,
      right: 16,
    },
  },
}));

export type FabAutoGrowProps = {
  to?: string;
  onClick?: () => void;
  color?: FabTypeMap['props']['color'];
  label: string;
  icon: React.ReactNode;
};

export const FabAutoGrow = ({ to, onClick, label, color, icon }: FabAutoGrowProps) => {
  const classes = useStyles();
  const BaseProps = { onClick, color, className: classes.fab };
  const Props = to ? { ...BaseProps, component: RouterLink, to } : BaseProps;

  return (
    <>
      <Fab sx={{ display: { xs: 'none', md: 'flex' } }} variant="extended" {...Props}>
        {icon}
        <Box sx={{ ml: 1 }}>{label}</Box>
      </Fab>

      <Fab sx={{ display: { xs: 'flex', md: 'none' } }} {...Props}>
        {icon}
      </Fab>
    </>
  );
};
