import type { SxProps, Theme } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import { EmptyState } from '../common/EmptyState';

export type EmptyEventsStateProps = {
  onAddEventClick: () => void;
  sx?: SxProps<Theme>;
};

export const EmptyEventsState = ({ onAddEventClick, sx }: EmptyEventsStateProps) => (
  <EmptyState
    genieVariant="calendar"
    sx={sx}
    title="Aucun événement pour le moment"
    subtitle="Créez votre premier événement pour commencer à organiser vos échanges de cadeaux et listes de souhaits !"
    actions={
      <Button variant="contained" size="large" onClick={onAddEventClick} startIcon={<AddIcon />}>
        Créer un événement
      </Button>
    }
  />
);
