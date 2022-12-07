import React, { useState } from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { Title } from '../common/Title';
import { Loader } from '../common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import PeopleIcon from '@mui/icons-material/People';
import { EventWishlists } from './EventWishlists';
import { Description } from '../common/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateTime } from 'luxon';
import { ConfirmButton } from '../common/ConfirmButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { RootState } from '../../core';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { EventAttendeesDialog } from './EventAttendeesDialog';

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const EventPage = () => {
  const { currentUserId } = useSelector(mapState);
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams<'eventId'>();
  const eventId = params.eventId || '';
  const api = useApi(wishlistApiRef);
  const { value: event, loading } = useAsync(() => api.event.getById(eventId), [eventId]);
  const nbAttendees = (event?.attendees || []).length + 1;
  const navigate = useNavigate();
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false);

  const deleteEvent = async () => {
    try {
      await api.event.delete(eventId);
      enqueueSnackbar("L'évènement à bien été supprimée", { variant: 'success' });
      navigate('/events');
    } catch (e) {
      enqueueSnackbar("Une erreur s'est produite", { variant: 'error' });
    }
  };

  return (
    <Box>
      <Loader loading={loading}>
        {!event && (
          <div>
            {/* TODO --> */}
            <span>Event not found</span>
          </div>
        )}
        {event && (
          <>
            <Title smallMarginBottom>{event.title}</Title>

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

            {event.created_by.id === currentUserId && (
              <Stack alignItems="center" justifyContent="center" sx={{ marginTop: '100px' }}>
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
              </Stack>
            )}
          </>
        )}
      </Loader>
    </Box>
  );
};
