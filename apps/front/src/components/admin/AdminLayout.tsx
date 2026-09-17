import type { PropsWithChildren } from 'react';

import { Box, Container, containerClasses, styled } from '@mui/material';

const AdminCanvas = styled(Box, { shouldForwardProp: prop => prop !== 'fillViewport' })<{ fillViewport?: boolean }>(
  ({ theme, fillViewport }) => ({
    backgroundColor: theme.palette.grey[50],
    minHeight: '100vh',
    paddingTop: theme.spacing(2.5),
    paddingBottom: fillViewport ? theme.spacing(3) : '130px',
    [theme.breakpoints.down('md')]: {
      paddingTop: '76px',
      paddingBottom: fillViewport ? 'calc(72px + env(safe-area-inset-bottom, 0px))' : '130px',
    },
    ...(fillViewport
      ? {
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          '@supports (height: 100dvh)': {
            height: '100dvh',
            maxHeight: '100dvh',
          },
        }
      : {}),
  }),
);

const AdminContainer = styled(Container, { shouldForwardProp: prop => prop !== 'fillViewport' })<{
  fillViewport?: boolean;
}>(({ theme, fillViewport }) => ({
  [`&.${containerClasses.root}`]: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    ...(fillViewport
      ? {
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }
      : {}),
  },
}));

type AdminLayoutProps = PropsWithChildren<{
  fillViewport?: boolean;
}>;

export const AdminLayout = ({ children, fillViewport = false }: AdminLayoutProps) => (
  <AdminCanvas fillViewport={fillViewport}>
    <AdminContainer maxWidth="xl" fillViewport={fillViewport}>
      {children}
    </AdminContainer>
  </AdminCanvas>
);
