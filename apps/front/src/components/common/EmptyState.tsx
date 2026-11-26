import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { keyframes, Stack, styled, Typography } from '@mui/material';

import { Genie, type GenieVariant } from './Genie';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const EmptyStateRoot = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(2),
  paddingInline: theme.spacing(2),
  animation: `${fadeInUp} 0.5s ease-out`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

const EmptyStateTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '1.35rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.primary.main,
}));

const EmptyStateSubtitle = styled(Typography)(({ theme }) => ({
  maxWidth: 420,
  marginTop: theme.spacing(0.75),
  marginInline: 'auto',
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
}));

const GENIE_SIZE = 170;

const EmptyStateGenie = styled(Genie)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& > img': {
      height: 130,
    },
  },
}));

const EmptyStateActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
}));

export type EmptyStateProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Buttons shown under the text. */
  actions?: ReactNode;
  /** What the genie is doing, to match the situation. */
  genieVariant?: GenieVariant;
  sx?: SxProps<Theme>;
};

/** Empty, not-found and "nothing yet" screens, with the floating genie. */
export const EmptyState = ({ title, subtitle, actions, genieVariant, sx }: EmptyStateProps) => (
  <EmptyStateRoot sx={sx}>
    <EmptyStateGenie variant={genieVariant} size={GENIE_SIZE} floating grounded />
    <div>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {subtitle ? <EmptyStateSubtitle>{subtitle}</EmptyStateSubtitle> : null}
    </div>
    {actions ? <EmptyStateActions>{actions}</EmptyStateActions> : null}
  </EmptyStateRoot>
);
