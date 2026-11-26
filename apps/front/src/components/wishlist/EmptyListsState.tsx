import type { SxProps, Theme } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import { EmptyState } from '../common/EmptyState';

export type EmptyListsStateProps = {
  title: string;
  subtitle: string;
  sx?: SxProps<Theme>;
  onAddListClick: () => void;
};

export const EmptyListsState = ({ title, subtitle, onAddListClick, sx }: EmptyListsStateProps) => (
  <EmptyState
    genieVariant="wishlist"
    sx={sx}
    title={title}
    subtitle={subtitle}
    actions={
      <Button variant="contained" size="large" onClick={onAddListClick} startIcon={<AddIcon />}>
        Ajouter ma liste
      </Button>
    }
  />
);
