import type { EventId } from '@wishlist/common';

import CloseIcon from '@mui/icons-material/Close';
import ForestIcon from '@mui/icons-material/Forest';
import { Button, IconButton, styled, Tooltip } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { SecretSantaRow, SecretSantaRowActions, SecretSantaRowLead } from './SecretSantaHeroRow';

const CreateButton = styled(Button)(({ theme }) => ({
  height: 32,
  padding: theme.spacing(0, 2),
  borderRadius: 999,
  fontSize: '0.8125rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}));

interface SecretSantaSuggestionCardProps {
  eventId: EventId;
  onDismiss: () => void;
}

export function SecretSantaSuggestionCard({ eventId, onDismiss }: SecretSantaSuggestionCardProps) {
  const navigate = useNavigate();

  const handleCreateSecretSanta = () => {
    void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.secretSanta } });
  };

  return (
    <SecretSantaRow as="section" aria-label="Suggestion Secret Santa">
      <SecretSantaRowLead
        visual={<ForestIcon />}
        eyebrow="Secret Santa · suggestion"
        title="Organisez un Secret Santa !"
        subtitle="Tirez au sort qui offre à qui, avec un budget max."
      />
      <SecretSantaRowActions>
        <CreateButton variant="contained" disableElevation onClick={handleCreateSecretSanta}>
          Créer un Secret Santa
        </CreateButton>
        <Tooltip title="Ne plus suggérer">
          <IconButton size="small" onClick={onDismiss} aria-label="Fermer la suggestion">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </SecretSantaRowActions>
    </SecretSantaRow>
  );
}
