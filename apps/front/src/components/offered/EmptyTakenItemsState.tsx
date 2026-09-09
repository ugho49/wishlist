import type { SxProps, Theme } from '@mui/material';

import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Box, Button, Stack, styled, Typography } from '@mui/material';

const EmptyStateContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(2),
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
  maxWidth: '420px',
}));

const BrowseEventsButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: '24px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
  '&:hover': {
    boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

export type EmptyTakenItemsStateProps = {
  title: string;
  subtitle: string;
  onBrowseEventsClick: () => void;
  sx?: SxProps<Theme>;
};

export const EmptyTakenItemsState = ({ title, subtitle, onBrowseEventsClick, sx }: EmptyTakenItemsStateProps) => (
  <EmptyStateContainer sx={sx}>
    <Box sx={{ textAlign: 'center' }}>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateSubtitle>{subtitle}</EmptyStateSubtitle>
    </Box>

    <BrowseEventsButton
      variant="contained"
      color="primary"
      onClick={onBrowseEventsClick}
      startIcon={<EventAvailableIcon />}
    >
      Voir les événements
    </BrowseEventsButton>
  </EmptyStateContainer>
);
