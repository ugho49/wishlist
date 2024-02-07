import React, { useState } from 'react';
import { Box, Button, Chip, Stack } from '@mui/material';
import { Title } from '../common/Title';
import { Loader } from '../common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { RouterLink, useToast } from '@wishlist/common-front';
import PeopleIcon from '@mui/icons-material/People';
import { EventWishlists } from './EventWishlists';
import { Description } from '../common/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateTime } from 'luxon';
import { ConfirmButton } from '../common/ConfirmButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { EventAttendeesDialog } from './EventAttendeesDialog';
import EditIcon from '@mui/icons-material/Edit';
import { useApi } from '@wishlist-front/hooks';
import { EventNotFound } from './EventNotFound';

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const EventPage = () => {
  const { currentUserId } = useSelector(mapState);
  const { addToast } = useToast();
  const params = useParams<'eventId'>();
  const eventId = params.eventId || '';
  const api = useApi();
  const { value: event, loading } = useAsync(() => api.event.getById(eventId), [eventId]);
  const nbAttendees = (event?.attendees || []).length + 1;
  const navigate = useNavigate();
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false);

  const deleteEvent = async () => {
    try {
      await api.event.delete(eventId);
      addToast({ message: "L'évènement à bien été supprimée", variant: 'success' });
      navigate('/events');
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    }
  };

  return (
    <Box>
      <Loader loading={loading}>
        {!event && <EventNotFound />}
        {event && (
          <>
            <Title smallMarginBottom>{event.title}</Title>

            {event.created_by.id === currentUserId && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={1}
                flexWrap="wrap"
                sx={{ marginBottom: '20px' }}
              >
                <ConfirmButton
                  confirmTitle="Supprimer l'évènement"
                  confirmText={
                    <span>
                      Etes vous sûr de supprimer l'évènement <b>{event.title}</b> ? Cela supprimera toutes les listes
                      associés !
                    </span>
                  }
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteEvent()}
                >
                  Supprimer l'évènement
                </ConfirmButton>
                <Button
                  component={RouterLink}
                  to={`/events/${eventId}/edit`}
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<EditIcon />}
                >
                  Modifier l'évènement
                </Button>
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              sx={{ marginBottom: '20px' }}
              gap={1}
            >
              <Chip
                variant="outlined"
                size="small"
                icon={<AccessTimeIcon />}
                label={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_HUGE)}
              />
              <Chip
                variant="outlined"
                size="small"
                icon={<PeopleIcon />}
                onClick={() => setOpenAttendeesDialog(true)}
                label={`${nbAttendees} ${nbAttendees > 1 ? 'participants' : 'participant'}`}
              />
            </Stack>

            {event.description && <Description text={event.description} />}

            <EventWishlists event={event} />

            <EventAttendeesDialog
              open={openAttendeesDialog}
              handleClose={() => setOpenAttendeesDialog(false)}
              creator={event.created_by}
              attendees={event.attendees}
            />
          </>
        )}
      </Loader>
    </Box>
  );
};
