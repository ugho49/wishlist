import type { PropsWithChildren } from 'react';

import { Box, Container, containerClasses, styled } from '@mui/material';

const AdminCanvas = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  minHeight: '100vh',
  paddingTop: theme.spacing(2.5),
  paddingBottom: '130px',
  [theme.breakpoints.down('md')]: {
    paddingTop: '76px',
  },
}));

const AdminContainer = styled(Container)(({ theme }) => ({
  [`&.${containerClasses.root}`]: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },
}));

export const AdminLayout = ({ children }: PropsWithChildren) => (
  <AdminCanvas>
    <AdminContainer maxWidth="xl">{children}</AdminContainer>
  </AdminCanvas>
);
