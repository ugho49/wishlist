import type { EventId } from '@wishlist/common';

import CloseIcon from '@mui/icons-material/Close';
import ForestIcon from '@mui/icons-material/Forest';
import { Button, IconButton, styled, Tooltip } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { useCreateSecretSanta } from '../../hooks';
import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { EditSecretSantaFormDialog } from '../secret-santa/EditSecretSantaFormDialog';
import { SecretSantaRow, SecretSantaRowActions, SecretSantaRowLead } from './SecretSantaHeroRow';

const SuggestionRow = styled(SecretSantaRow)(({ theme }) => ({
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    '& > :first-of-type': {
      paddingRight: theme.spacing(4),
    },
  },
}));

const Actions = styled(SecretSantaRowActions)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'center',
  },
}));

const CreateButton = styled(Button)(({ theme }) => ({
  height: 32,
  padding: theme.spacing(0, 2),
  borderRadius: 999,
  fontSize: '0.8125rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}));

const DismissButton = styled(IconButton)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    position: 'absolute',
    top: theme.spacing(1.5),
    right: theme.spacing(-0.5),
  },
}));

interface SecretSantaSuggestionCardProps {
  eventId: EventId;
  onDismiss: () => void;
}

export function SecretSantaSuggestionCard({ eventId, onDismiss }: SecretSantaSuggestionCardProps) {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const { createSecretSanta, loading } = useCreateSecretSanta(eventId);

  return (
    <>
      <SuggestionRow as="section" aria-label="Suggestion Secret Santa">
        <SecretSantaRowLead
          visual={<ForestIcon />}
          eyebrow="Secret Santa · suggestion"
          title="Organisez un Secret Santa !"
          subtitle="Tirez au sort qui offre à qui, avec un budget max."
        />
        <Actions>
          <CreateButton variant="contained" disableElevation loading={loading} onClick={() => setOpenDialog(true)}>
            Créer un Secret Santa
          </CreateButton>
          <Tooltip title="Ne plus suggérer">
            <DismissButton size="small" onClick={onDismiss} aria-label="Ne plus suggérer">
              <CloseIcon fontSize="small" />
            </DismissButton>
          </Tooltip>
        </Actions>
      </SuggestionRow>

      <EditSecretSantaFormDialog
        title="Créer un secret santa"
        open={openDialog}
        saveButtonText="Créer"
        input={{}}
        handleClose={() => setOpenDialog(false)}
        handleSubmit={async input => {
          setOpenDialog(false);
          const created = await createSecretSanta(input);
          if (created) {
            void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.secretSanta } });
          }
        }}
      />
    </>
  );
}
