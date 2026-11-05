import type { SecretSantaUserId } from '@wishlist/common';
import type { SecretSantaFormInput } from './EditSecretSantaFormDialog';
import type { SecretSantaStep } from './SecretSantaStatusCard';
import type { SecretSantaEvent, SecretSantaItem } from './secret-santa.types';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { styled } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { SecretSantaDrawService } from '@wishlist/common';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { match } from 'ts-pattern';

import {
  rejectionMessage,
  rejectionPattern,
  SecretSantaStatus,
  useCancelSecretSantaMutation,
  useDeleteSecretSantaMutation,
  useDeleteSecretSantaUserMutation,
  useStartSecretSantaMutation,
  useUpdateSecretSantaMutation,
} from '../../gql';
import { useToast } from '../../hooks';
import { wholeEurosFormatter } from '../../utils/currency.utils';
import { ConfirmButton } from '../common/ConfirmButton';
import { AddSecretSantaUsersFormDialog } from './AddSecretSantaUsersFormDialog';
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog';
import { ManageUserExclusionsDialog } from './ManageUserExclusionsDialog';
import { ManageStack } from './SecretSantaManageCard';
import { SecretSantaParticipantsCard } from './SecretSantaParticipantsCard';
import { SecretSantaSettingsCard } from './SecretSantaSettingsCard';
import { SecretSantaStatusCard } from './SecretSantaStatusCard';

const DangerZone = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: theme.spacing(1),
  '& > .MuiButton-root': {
    borderRadius: 999,
    fontWeight: 600,
  },
}));

type SecretSantaProps = {
  secretSanta: SecretSantaItem;
  event: SecretSantaEvent;
};

// Validation rejections carry the server's business-rule messages (e.g. draw
// constraints), the other rejection members don't select `message`
const validationMessage = (rejection: { __typename: 'ValidationRejection'; errors: { message: string }[] }) =>
  rejection.errors.length > 0 ? rejection.errors.map(error => error.message).join(', ') : rejectionMessage(rejection);

const MIN_PARTICIPANTS = 2;

const getDrawStepState = (started: boolean, participantsReady: boolean): SecretSantaStep['state'] => {
  if (started) return 'done';
  return participantsReady ? 'current' : 'todo';
};

export const SecretSanta = ({ secretSanta, event }: SecretSantaProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openSecretSantaUsersModal, setOpenSecretSantaUsersModal] = useState(false);
  const [status, setStatus] = useState(secretSanta.status);
  const [description, setDescription] = useState(secretSanta.description);
  const [budget, setBudget] = useState(secretSanta.budget);
  const [currentUserIdModalExclusion, setCurrentUserIdModalExclusion] = useState<string | undefined>();
  const [secretSantaUsers, setSecretSantaUsers] = useState(secretSanta.users || []);
  const eventAttendees = useMemo(() => event.attendees || [], [event]);
  const eventId = event.id;
  const eventInPast = DateTime.fromISO(event.eventDate) < DateTime.now();
  const started = status === SecretSantaStatus.Started;

  useEffect(() => {
    setStatus(secretSanta.status);
    setDescription(secretSanta.description);
    setBudget(secretSanta.budget);
    setSecretSantaUsers(secretSanta.users || []);
  }, [secretSanta]);

  const invalidate = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['GetSecretSantaForEvent', { eventId }] }),
        queryClient.invalidateQueries({ queryKey: ['EventPageGetEvent', { eventId }] }),
        queryClient.invalidateQueries({ queryKey: ['GetMySecretSantaDraw', { eventId }] }),
      ]),
    [queryClient, eventId],
  );

  const onNetworkError = useCallback(
    () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    [addToast],
  );

  const { mutateAsync: startMutation, isPending: loadingStart } = useStartSecretSantaMutation({
    onError: onNetworkError,
  });
  const { mutateAsync: updateMutation, isPending: loadingUpdate } = useUpdateSecretSantaMutation({
    onError: onNetworkError,
  });
  const { mutateAsync: cancelMutation, isPending: loadingCancel } = useCancelSecretSantaMutation({
    onError: onNetworkError,
  });
  const { mutateAsync: deleteMutation, isPending: loadingDelete } = useDeleteSecretSantaMutation({
    onError: onNetworkError,
  });
  const { mutateAsync: removeUserMutation, isPending: loadingRemoveUser } = useDeleteSecretSantaUserMutation({
    onError: onNetworkError,
  });

  const updateSecretSanta = useCallback(
    async (input: SecretSantaFormInput) => {
      const res = await updateMutation({ id: secretSanta.id, input });
      await match(res.updateSecretSanta)
        .with({ __typename: 'VoidOutput' }, async () => {
          setBudget(input.budget ?? null);
          setDescription(input.description ?? null);
          addToast({ message: 'Le secret santa a été modifié', variant: 'success' });
          await invalidate();
        })
        .with({ __typename: 'ValidationRejection' }, rejection =>
          addToast({ message: validationMessage(rejection), variant: 'error' }),
        )
        .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
        .exhaustive();
    },
    [updateMutation, secretSanta.id, addToast, invalidate],
  );

  const cancelSecretSanta = useCallback(async () => {
    const res = await cancelMutation({ id: secretSanta.id });
    await match(res.cancelSecretSanta)
      .with({ __typename: 'VoidOutput' }, async () => {
        addToast({ message: 'Le tirage a été annulé', variant: 'success' });
        setStatus(SecretSantaStatus.Created);
        await invalidate();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  }, [cancelMutation, secretSanta.id, addToast, invalidate]);

  const deleteSecretSanta = useCallback(async () => {
    const res = await deleteMutation({ id: secretSanta.id });
    await match(res.deleteSecretSanta)
      .with({ __typename: 'VoidOutput' }, async () => {
        addToast({ message: 'Secret santa supprimé avec succès', variant: 'success' });
        await invalidate();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  }, [deleteMutation, secretSanta.id, addToast, invalidate]);

  const removeSecretSantaUser = useCallback(
    async (secretSantaUserId: SecretSantaUserId) => {
      const res = await removeUserMutation({ id: secretSanta.id, secretSantaUserId });
      await match(res.deleteSecretSantaUser)
        .with({ __typename: 'VoidOutput' }, async () => {
          setSecretSantaUsers(prev => prev.filter(u => u.id !== secretSantaUserId));
          await invalidate();
        })
        .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
        .exhaustive();
    },
    [removeUserMutation, secretSanta.id, invalidate, addToast],
  );

  const drawBlockedReason = useMemo(() => {
    if (started) return;
    if (secretSantaUsers.length < MIN_PARTICIPANTS) {
      return `Ajoutez au moins ${MIN_PARTICIPANTS} participants pour pouvoir lancer le tirage.`;
    }
    const { isPossible, reason } = new SecretSantaDrawService(secretSantaUsers).isDrawPossible();
    return isPossible ? undefined : reason;
  }, [started, secretSantaUsers]);

  const startSecretSanta = useCallback(async () => {
    if (drawBlockedReason) {
      addToast({ message: drawBlockedReason, variant: 'warning' });
      return;
    }

    const res = await startMutation({ id: secretSanta.id });
    await match(res.startSecretSanta)
      .with({ __typename: 'VoidOutput' }, async () => {
        setStatus(SecretSantaStatus.Started);
        addToast({ message: 'Tirage effectué, les participants ont reçu un email', variant: 'success' });
        await invalidate();
      })
      .with({ __typename: 'ValidationRejection' }, rejection =>
        addToast({ message: validationMessage(rejection), variant: 'error' }),
      )
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  }, [drawBlockedReason, startMutation, secretSanta.id, addToast, invalidate]);

  const loading = loadingStart || loadingCancel || loadingDelete || loadingUpdate || loadingRemoveUser;
  const availableAttendeesCount = eventAttendees.filter(
    attendee => !secretSantaUsers.some(user => user.attendee.id === attendee.id),
  ).length;

  const steps = useMemo<SecretSantaStep[]>(() => {
    const participantsReady = secretSantaUsers.length >= MIN_PARTICIPANTS && !drawBlockedReason;
    const participantsCount = `${secretSantaUsers.length} participant${secretSantaUsers.length > 1 ? 's' : ''}`;
    return [
      {
        label: 'Réglages',
        hint: budget ? `${wholeEurosFormatter.format(budget)} max` : 'Budget libre',
        state: 'done',
      },
      {
        label: 'Participants',
        hint: participantsReady ? participantsCount : `${MIN_PARTICIPANTS} minimum`,
        state: participantsReady || started ? 'done' : 'current',
      },
      {
        label: 'Tirage',
        hint: started ? 'Effectué' : 'À lancer',
        state: getDrawStepState(started, participantsReady),
      },
    ];
  }, [budget, secretSantaUsers.length, drawBlockedReason, started]);

  return (
    <ManageStack>
      <SecretSantaStatusCard
        started={started}
        eventInPast={eventInPast}
        drawBlockedReason={drawBlockedReason}
        steps={steps}
        loading={loading}
        onStart={() => void startSecretSanta()}
        onCancel={() => void cancelSecretSanta()}
      />

      <SecretSantaSettingsCard
        budget={budget}
        description={description}
        editable={!started}
        loading={loading}
        onEdit={() => setOpenEditModal(true)}
      />

      <SecretSantaParticipantsCard
        users={secretSantaUsers}
        editable={!started}
        canAdd={availableAttendeesCount > 0}
        loading={loading}
        onAdd={() => setOpenSecretSantaUsersModal(true)}
        onManageExclusions={setCurrentUserIdModalExclusion}
        onRemove={id => void removeSecretSantaUser(id)}
      />

      {!started && (
        <DangerZone>
          <ConfirmButton
            confirmTitle="Supprimer le Secret Santa ?"
            confirmText="Les participants, exclusions et réglages seront définitivement supprimés."
            confirmButton="Supprimer"
            variant="text"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            loading={loadingDelete}
            disabled={loading}
            onClick={() => void deleteSecretSanta()}
          >
            Supprimer le Secret Santa
          </ConfirmButton>
        </DangerZone>
      )}

      <EditSecretSantaFormDialog
        title="Modifier le secret santa"
        open={openEditModal}
        saveButtonText="Modifier"
        handleSubmit={input => {
          setOpenEditModal(false);
          void updateSecretSanta(input);
        }}
        handleClose={() => setOpenEditModal(false)}
        input={{ budget, description }}
      />

      <AddSecretSantaUsersFormDialog
        open={openSecretSantaUsersModal}
        handleSubmit={newSecretSantaUsers => {
          setSecretSantaUsers(prev => [...prev, ...newSecretSantaUsers]);
          setOpenSecretSantaUsersModal(false);
        }}
        handleClose={() => setOpenSecretSantaUsersModal(false)}
        secretSantaId={secretSanta.id}
        eventId={eventId}
        eventAttendees={eventAttendees}
        secretSantaAttendees={secretSantaUsers.map(u => u.attendee)}
      />

      <ManageUserExclusionsDialog
        open={currentUserIdModalExclusion !== undefined}
        eventId={eventId}
        secretSantaId={secretSanta.id}
        secretSantaUser={secretSantaUsers.find(u => u.id === currentUserIdModalExclusion)!}
        handleClose={() => setCurrentUserIdModalExclusion(undefined)}
        otherSecretSantaUser={secretSantaUsers.filter(u => u.id !== currentUserIdModalExclusion)}
      />
    </ManageStack>
  );
};
