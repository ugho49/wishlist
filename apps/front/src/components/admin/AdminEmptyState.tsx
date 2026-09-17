import type { ReactNode } from 'react';

import { Box, styled, Typography } from '@mui/material';

export type AdminEmptyStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
};

const EmptyRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  padding: theme.spacing(4, 1),
}));

const EmptyTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.text.primary,
}));

const EmptyDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

export const AdminEmptyState = ({ title, description, action }: AdminEmptyStateProps) => (
  <EmptyRoot>
    {title ? <EmptyTitle>{title}</EmptyTitle> : null}
    <EmptyDescription>{description}</EmptyDescription>
    {action}
  </EmptyRoot>
);
