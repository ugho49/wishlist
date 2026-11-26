import type { SxProps, Theme } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import { EmptyState } from '../common/EmptyState';
import { ImportItemsButton } from './ImportItemsButton';

export type EmptyItemsStateProps = {
  onAddItem: () => void;
  isOwner: boolean;
  hasImportableItems: boolean;
  onImportItems: () => void;
  sx?: SxProps<Theme>;
};

const subtitleFor = (isOwner: boolean, hasImportableItems: boolean) => {
  if (!isOwner) return 'Cette liste ne contient aucun souhait. Vous pouvez suggérer un souhait !';
  if (hasImportableItems) return "Commencez par importer d'anciens souhaits ou ajoutez-en de nouveaux !";
  return 'Ajoutez votre premier souhait à cette liste et partagez vos envies !';
};

export const EmptyItemsState = ({
  onAddItem,
  isOwner,
  hasImportableItems,
  onImportItems,
  sx = { marginTop: { xs: 0, md: 5 } },
}: EmptyItemsStateProps) => (
  <EmptyState
    genieVariant="wishlist"
    sx={sx}
    title="Aucun souhait pour le moment"
    subtitle={subtitleFor(isOwner, hasImportableItems)}
    actions={
      <>
        {isOwner && hasImportableItems ? (
          <ImportItemsButton onClick={onImportItems} size="large">
            Importer d'anciens souhaits
          </ImportItemsButton>
        ) : null}
        <Button variant="contained" size="large" onClick={onAddItem} startIcon={<AddIcon />}>
          {isOwner ? 'Ajouter un souhait' : 'Suggérer un souhait'}
        </Button>
      </>
    }
  />
);
