import type { SxProps, Theme } from '@mui/material';

import { Box, Stack, styled, Typography } from '@mui/material';

import EmptyReservedItemsIllustration from '../../assets/illustrations/secret-santa.png';

const EmptyStateContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const Illustration = styled('img')(({ theme }) => ({
  width: '150px',
  height: '150px',
  [theme.breakpoints.down('sm')]: {
    width: '100px',
    height: '100px',
  },
}));

const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

const EmptyStateSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: '400px',
}));

export type EmptyReservedItemsStateProps = {
  sx?: SxProps<Theme>;
};

export const EmptyReservedItemsState = ({ sx }: EmptyReservedItemsStateProps) => (
  <EmptyStateContainer sx={sx}>
    <Illustration src={EmptyReservedItemsIllustration} alt="" />
    <Box sx={{ textAlign: 'center' }}>
      <EmptyStateTitle>Aucun cadeau réservé</EmptyStateTitle>
      <EmptyStateSubtitle>Les cadeaux que vous réservez sur les listes des autres apparaîtront ici.</EmptyStateSubtitle>
    </Box>
  </EmptyStateContainer>
);
