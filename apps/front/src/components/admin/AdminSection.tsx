import type { BoxProps } from '@mui/material';
import type { PropsWithChildren } from 'react';

import { Box, styled } from '@mui/material';

const SectionRoot = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: 'none',
  padding: theme.spacing(2.5),
}));

export const AdminSection = ({ children, ...props }: PropsWithChildren<BoxProps>) => (
  <SectionRoot {...props}>{children}</SectionRoot>
);
