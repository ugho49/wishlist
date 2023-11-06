import React, { useMemo, useState } from 'react';
import { AddEventAttendeeInputDto, AttendeeDto, AttendeeRole, MiniUserDto } from '@wishlist/common-types';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { SearchUserSelect } from '../user/SearchUserSelect';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { Card } from '../common/Card';
import DeleteIcon from '@mui/icons-material/Delete';
import { blue, green, orange } from '@mui/material/colors';
import PersonIcon from '@mui/icons-material/Person';
import { ConfirmIconButton } from '../common/ConfirmIconButton';

export type EditEventAttendeesProps = {
  eventId: string;
  creator: MiniUserDto;
  attendees: AttendeeDto[];
  onChange: (attendees: AttendeeDto[]) => void;
};

const mapState = (state: RootState) => ({ currentUserEmail: state.auth.user?.email });

export const EditEventAttendees = ({ eventId, creator, attendees, onChange }: EditEventAttendeesProps) => {
  const { currentUserEmail } = useSelector(mapState);
  const api = useApi(wishlistApiRef);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const attendeeEmails = useMemo(
    () => attendees.map((attendee) => (attendee.pending_email ? attendee.pending_email : attendee.user?.email || '')),
    [attendees],
  );

  const addAttendee = async (attendee: AddEventAttendeeInputDto) => {
    setLoading(true);

    try {
      const newAttendee = await api.attendee.addAttendee({
        event_id: eventId,
        email: attendee.email,
        role: attendee.role,
      });
      onChange([newAttendee, ...attendees]);
      addToast({ message: "Participant ajouté à l'évènement !", variant: 'info' });
    } catch (e) {
      addToast({ message: "Impossible d'ajouter ce participant", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteAttendee = async (attendee: AttendeeDto) => {
    setLoading(true);

    try {
      await api.attendee.deleteAttendee(attendee.id);
      onChange([...attendees].filter((a) => a.id !== attendee.id));
      addToast({ message: "Participant supprimé de l'évènement !", variant: 'info' });
    } catch (e) {
      addToast({ message: 'Impossible de supprimer ce participant', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Box>
        <InputLabel>Ajouter un nouveau participant à l'évènement ?</InputLabel>

        <SearchUserSelect
          disabled={loading}
          excludedEmails={[...attendeeEmails, currentUserEmail || '']}
          onChange={(value) =>
            addAttendee({ email: typeof value === 'string' ? value : value.email, role: AttendeeRole.USER })
          }
        />
      </Box>

      <Divider sx={{ marginBlock: '20px' }} />

      <List sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Card variant="outlined" sx={{ padding: 0 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: green[100], color: green[600] }} src={creator.picture_url}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<b>{`${creator.firstname} ${creator.lastname}`}</b>} secondary={creator.email} />
          </ListItem>
        </Card>
        {attendees.map((attendee) => (
          <Card variant="outlined" sx={{ padding: 0 }} key={attendee.id}>
            <ListItem
              secondaryAction={
                <ConfirmIconButton
                  confirmTitle="Enlever ce participant ?"
                  confirmText={
                    <>
                      Êtes-vous sur de retirer le participant{' '}
                      <b>
                        {attendee.pending_email
                          ? attendee.pending_email
                          : `${attendee.user?.firstname} ${attendee.user?.lastname}`}
                      </b>{' '}
                      de l'évènement ?
                    </>
                  }
                  onClick={() => deleteAttendee(attendee)}
                >
                  <DeleteIcon />
                </ConfirmIconButton>
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: attendee.pending_email ? orange[100] : blue[100],
                    color: attendee.pending_email ? orange[600] : blue[600],
                  }}
                  src={attendee.user?.picture_url}
                >
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <b>
                    {attendee.pending_email
                      ? 'Inviter le participant'
                      : `${attendee.user?.firstname} ${attendee.user?.lastname}`}
                  </b>
                }
                secondary={attendee.pending_email ? attendee.pending_email : attendee.user?.email}
              />
            </ListItem>
          </Card>
        ))}
      </List>
    </Stack>
  );
};
