import type { AttendeeId, EventId } from '@wishlist/common';
import type { RootState } from '../../core/store';
import type { EventAttendee } from './event.types';

import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Divider, List, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import {
  AttendeeRole,
  rejectionMessage,
  rejectionPattern,
  useAddEventAttendeeMutation,
  useRemoveEventAttendeeMutation,
  useUpdateEventAttendeeRoleMutation,
} from '../../gql';
import { useToast } from '../../hooks';
import { Card } from '../common/Card';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import { Subtitle } from '../common/Subtitle';
import { SearchUserSelect } from '../user/SearchUserSelect';
import { AttendeeRolesGuide } from './AttendeeRolesGuide';
import { AttendeeListItem, ListItemAttendee } from './ListItemAttendee';

export type EditEventAttendeesProps = {
  eventId: EventId;
  attendees: EventAttendee[];
};

const mapState = (state: RootState) => ({ email: state.auth.user?.email, id: state.auth.user?.id });

export const EditEventAttendees = ({ eventId, attendees }: EditEventAttendeesProps) => {
  const { id: currentUserId, email: currentUserEmail } = useSelector(mapState);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const attendeeEmails = useMemo(
    () => attendees.map(attendee => (attendee.pendingEmail ? attendee.pendingEmail : attendee.user?.email || '')),
    [attendees],
  );

  const invalidateEvent = () => queryClient.invalidateQueries({ queryKey: ['EventPageGetEvent', { eventId }] });

  const { mutateAsync: addAttendeeMutation, isPending: addAttendeePending } = useAddEventAttendeeMutation({
    onError: () => addToast({ message: "Impossible d'ajouter ce participant", variant: 'error' }),
  });
  const { mutateAsync: removeAttendeeMutation, isPending: deleteAttendeePending } = useRemoveEventAttendeeMutation({
    onError: () => addToast({ message: 'Impossible de supprimer ce participant', variant: 'error' }),
  });
  const { mutateAsync: updateRoleMutation, isPending: updateRolePending } = useUpdateEventAttendeeRoleMutation({
    onError: () => addToast({ message: 'Impossible de modifier le rôle', variant: 'error' }),
  });

  const addAttendee = async (email: string) => {
    const res = await addAttendeeMutation({ eventId, input: { email, role: AttendeeRole.Participant } });
    match(res.addEventAttendee)
      .with({ __typename: 'EventAttendee' }, () => {
        addToast({ message: "Participant ajouté à l'évènement !", variant: 'info' });
        void invalidateEvent();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const deleteAttendee = async (attendeeId: AttendeeId) => {
    const res = await removeAttendeeMutation({ eventId, attendeeId });
    match(res.removeEventAttendee)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: "Participant supprimé de l'évènement !", variant: 'info' });
        void invalidateEvent();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const updateRole = async (attendeeId: AttendeeId, role: AttendeeRole) => {
    const res = await updateRoleMutation({ eventId, attendeeId, role });
    match(res.updateEventAttendeeRole)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Rôle mis à jour', variant: 'info' });
        void invalidateEvent();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const loading = useMemo(
    () => addAttendeePending || deleteAttendeePending || updateRolePending,
    [addAttendeePending, deleteAttendeePending, updateRolePending],
  );

  return (
    <Stack gap={2}>
      <AttendeeRolesGuide />

      <Card>
        <Subtitle>Gérer les participants</Subtitle>

        <Box>
          <SearchUserSelect
            label="Ajouter un nouveau participant à l'évènement ?"
            disabled={loading}
            excludedEmails={[...attendeeEmails, currentUserEmail || '']}
            onChange={value => addAttendee(typeof value === 'string' ? value : value.email)}
          />
        </Box>

        <Divider sx={{ marginBlock: '20px' }} />

        <List disablePadding>
          {attendees.map(attendee => {
            const isCurrentUser = attendee.user?.id === currentUserId;
            const isCreator = attendee.role === AttendeeRole.Creator;
            const canDelete = !isCurrentUser && !isCreator;
            const canChangeRole = !isCurrentUser && !isCreator;

            return (
              <AttendeeListItem
                key={attendee.id}
                className="animated zoomIn fast"
                secondaryAction={
                  <ConfirmIconButton
                    disabled={!canDelete || loading}
                    confirmTitle="Enlever ce participant ?"
                    confirmText={
                      <>
                        Êtes-vous sur de retirer le participant{' '}
                        <b>
                          {attendee.pendingEmail
                            ? attendee.pendingEmail
                            : `${attendee.user?.firstName} ${attendee.user?.lastName}`}
                        </b>{' '}
                        de l'évènement ?
                      </>
                    }
                    onClick={() => deleteAttendee(attendee.id)}
                  >
                    <DeleteIcon />
                  </ConfirmIconButton>
                }
              >
                <ListItemAttendee
                  role={attendee.role}
                  userName={`${attendee.user?.firstName} ${attendee.user?.lastName}`}
                  isPending={!!attendee.pendingEmail}
                  email={attendee.pendingEmail ?? attendee.user?.email ?? ''}
                  pictureUrl={attendee.user?.pictureUrl ?? undefined}
                  roleEditable={canChangeRole}
                  roleDisabled={loading}
                  onRoleChange={role => updateRole(attendee.id, role)}
                />
              </AttendeeListItem>
            );
          })}
        </List>
      </Card>
    </Stack>
  );
};
