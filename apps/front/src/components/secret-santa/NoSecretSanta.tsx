import type { EventId } from '@wishlist/common';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';

import { useCreateSecretSanta } from '../../hooks';
import { EmptyState } from '../common/EmptyState';
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog';

type NoSecretSantaProps = {
  eventId: EventId;
};

export const NoSecretSanta = ({ eventId }: NoSecretSantaProps) => {
  const [openModal, setOpenModal] = useState(false);
  const { createSecretSanta, loading } = useCreateSecretSanta(eventId);

  return (
    <>
      <EmptyState
        genieVariant="santa"
        title="Aucun secret santa n'est en cours pour cet évènement"
        subtitle="Vous pouvez en créer un en cliquant sur le bouton ci-dessous."
        actions={
          <Button
            variant="contained"
            size="large"
            loading={loading}
            disabled={loading}
            onClick={() => setOpenModal(true)}
            startIcon={<AddIcon />}
          >
            Créer un secret santa
          </Button>
        }
      />
      <EditSecretSantaFormDialog
        title="Créer un secret santa"
        open={openModal}
        saveButtonText="Créer"
        handleSubmit={input => {
          setOpenModal(false);
          void createSecretSanta(input);
        }}
        handleClose={() => setOpenModal(false)}
        input={{}}
      />
    </>
  );
};
