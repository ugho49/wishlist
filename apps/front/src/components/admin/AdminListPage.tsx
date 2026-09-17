import type { ReactNode } from 'react';

import { Box, styled } from '@mui/material';

import { AdminSection } from './AdminSection';

const Root = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  height: '100%',
});

const HeaderSlot = styled(Box)({
  flexShrink: 0,
});

type AdminListPageProps = {
  header: ReactNode;
  children: ReactNode;
};

export const AdminListPage = ({ header, children }: AdminListPageProps) => (
  <Root>
    <HeaderSlot>{header}</HeaderSlot>
    <AdminSection fill>{children}</AdminSection>
  </Root>
);
