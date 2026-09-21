import type { EventId } from '@wishlist/common';
import type { RootState } from '../../core/store';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AttendeeRole, isRejection, rejectionMessage, useSecretSantaListPageGetAdminEventsQuery } from '../../gql';
import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { Loader } from '../common/Loader';
import { EventIcon } from '../event/EventIcon';

const mapCurrentUserId = (state: RootState) => state.auth.user?.id;

const ADMIN_ROLES: AttendeeRole[] = [AttendeeRole.Creator, AttendeeRole.Admin];

export type CreateSecretSantaFromEventDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateSecretSantaFromEventDialog = ({ open, onClose }: CreateSecretSantaFromEventDialogProps) => {
  const currentUserId = useSelector(mapCurrentUserId);
  const navigate = useNavigate();
  const { data, isLoading: loading } = useSecretSantaListPageGetAdminEventsQuery(
    { filters: { page: 1, limit: 100 } },
    { enabled: open, select: d => d.events },
  );
  const pagedEvents = data?.__typename === 'GetEventsPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const adminEvents = useMemo(
    () =>
      (pagedEvents?.data ?? []).filter(event =>
        event.attendees.some(attendee => attendee.user?.id === currentUserId && ADMIN_ROLES.includes(attendee.role)),
      ),
    [pagedEvents?.data, currentUserId],
  );

  const handleEventClick = (eventId: EventId) => {
    onClose();
    void navigate({
      to: '/events/$eventId/edit',
      params: { eventId },
      search: { tab: TabValues.secretSanta },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Créer un Secret Santa</span>
          <IconButton onClick={onClose} aria-label="Fermer">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Un Secret Santa se lance depuis un évènement pour lequel vous êtes organisateur. Choisissez un évènement :
        </Typography>

        {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

        <Loader loading={loading}>
          {adminEvents.length === 0 && !queryRejection && (
            <>
              <Typography variant="body2" color="text.secondary">
                Vous n&apos;êtes organisateur d&apos;aucun évènement. Créez-en un pour pouvoir lancer un Secret Santa.
              </Typography>
              <DialogActions sx={{ px: 0, justifyContent: 'flex-start' }}>
                <Button
                  variant="text"
                  onClick={() => {
                    onClose();
                    void navigate({ to: '/events/new' });
                  }}
                >
                  Créer un évènement
                </Button>
              </DialogActions>
            </>
          )}
          {adminEvents.length > 0 && (
            <List disablePadding>
              {adminEvents.map(event => (
                <ListItemButton key={event.id} onClick={() => handleEventClick(event.id)}>
                  <ListItemAvatar>
                    <EventIcon icon={event.icon ?? undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<b>{event.title}</b>}
                    secondary={`${DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATE_MED)}${
                      event.secretSanta ? ' · Secret Santa déjà créé' : ''
                    }`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Loader>
      </DialogContent>
    </Dialog>
  );
};
