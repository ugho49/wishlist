import type { SxProps, Theme } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import { EmptyState } from '../common/EmptyState';

export type EmptySecretSantasStateProps = {
  onCreateClick: () => void;
  sx?: SxProps<Theme>;
};

export const EmptySecretSantasState = ({ onCreateClick, sx }: EmptySecretSantasStateProps) => (
  <EmptyState
    genieVariant="santa"
    sx={sx}
    title="Aucun Secret Santa pour le moment"
    subtitle="Lancez un Secret Santa depuis un évènement dont vous êtes organisateur, ou rejoignez-en un."
    actions={
      <Button variant="contained" size="large" onClick={onCreateClick} startIcon={<AddIcon />}>
        Créer un secret santa
      </Button>
    }
  />
);
