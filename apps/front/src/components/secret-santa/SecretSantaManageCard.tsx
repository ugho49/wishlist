import { alpha, styled } from '@mui/material';

import { SectionTitle } from '../common/PageHero';

export const ManageStack = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(3),
  },
}));

export const ManageCard = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

export const ManageCardHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}));

export const ManageCardTitle = styled(SectionTitle)({
  minHeight: 32,
});

export const ManageCardSubtitle = styled('p')(({ theme }) => ({
  margin: theme.spacing(0.25, 0, 0),
  fontSize: '0.8125rem',
  lineHeight: 1.45,
  color: theme.palette.text.secondary,
}));
