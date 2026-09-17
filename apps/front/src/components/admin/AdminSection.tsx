import type { BoxProps } from '@mui/material';
import type { PropsWithChildren, ReactNode } from 'react';

import { Box, styled } from '@mui/material';

const SectionRoot = styled(Box, { shouldForwardProp: prop => prop !== 'fill' })<{ fill?: boolean }>(
  ({ theme, fill }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[200]}`,
    boxShadow: 'none',
    padding: theme.spacing(2.5),
    overflow: 'hidden',
    ...(fill
      ? {
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }
      : {}),
  }),
);

const SectionFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  marginTop: theme.spacing(1.5),
  marginLeft: theme.spacing(-2.5),
  marginRight: theme.spacing(-2.5),
  marginBottom: theme.spacing(-2.5),
}));

type AdminSectionProps = PropsWithChildren<BoxProps> & {
  footer?: ReactNode;
  fill?: boolean;
};

export const AdminSection = ({ children, footer, fill, ...props }: AdminSectionProps) => (
  <SectionRoot {...props} fill={fill}>
    {children}
    {footer ? <SectionFooter>{footer}</SectionFooter> : null}
  </SectionRoot>
);
