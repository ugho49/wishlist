import type { AttendeeId, EventId } from '@wishlist/common';
import type { RootState } from '../../core/store';
import type { EventAttendeesWithoutWishlistQuery } from '../../gql';

import CloseIcon from '@mui/icons-material/Close';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import {
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import {
  BusinessRuleCode,
  rejectionMessage,
  rejectionPattern,
  useEventAttendeesWithoutWishlistQuery,
  useRemindEventAttendeesMutation,
} from '../../gql';
import { useToast } from '../../hooks';
import { EmptyState } from '../common/EmptyState';
import { REMINDERS_RATE_LIMITED_MESSAGE } from './event.messages';

type AttendeeWithoutWishlist = Extract<
  EventAttendeesWithoutWishlistQuery['event'],
  { __typename: 'Event' }
>['attendeesWithoutWishlist'][number];

const mapState = (state: RootState) => state.auth.user?.id;

const LoadingBox = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(4, 0),
}));

const AttendeeName = styled('span')({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const attendeeName = (attendee: AttendeeWithoutWishlist) =>
  attendee.user ? `${attendee.user.firstName} ${attendee.user.lastName}` : (attendee.pendingEmail ?? '');

const attendeeInitials = (attendee: AttendeeWithoutWishlist) =>
  attendee.user
    ? `${attendee.user.firstName[0] ?? ''}${attendee.user.lastName[0] ?? ''}`.toUpperCase()
    : (attendee.pendingEmail?.[0]?.toUpperCase() ?? '?');

const attendeeStatus = (attendee: AttendeeWithoutWishlist): string => {
  const lastReminder = attendee.lastRemindedAt ? DateTime.fromISO(attendee.lastRemindedAt).toRelative() : undefined;

  if (!attendee.canBeReminded) return `Déjà relancé ${lastReminder ?? 'récemment'}, réessayez plus tard`;

  const status = attendee.user ? "N'a pas encore rempli sa liste" : 'Invitation en attente : pas encore de compte';
  return lastReminder ? `${status} · relancé ${lastReminder}` : status;
};

export type RemindAttendeesDialogProps = {
  open: boolean;
  onClose: () => void;
  eventId: EventId;
};

export const RemindAttendeesDialog = ({ open, onClose, eventId }: RemindAttendeesDialogProps) => {
  const currentUserId = useSelector(mapState);
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  // Every remindable attendee is selected by default: only the ones the user unticks are kept.
  const [unselectedIds, setUnselectedIds] = useState<Set<AttendeeId>>(new Set());

  const { data, isLoading } = useEventAttendeesWithoutWishlistQuery(
    { eventId },
    { enabled: open, select: d => d.event },
  );

  const attendees = useMemo(
    () =>
      data?.__typename === 'Event'
        ? data.attendeesWithoutWishlist.filter(attendee => attendee.user?.id !== currentUserId)
        : [],
    [data, currentUserId],
  );
  const selectedIds = useMemo(
    () => attendees.filter(a => a.canBeReminded && !unselectedIds.has(a.id)).map(a => a.id),
    [attendees, unselectedIds],
  );

  const { mutateAsync: remindAttendees, isPending } = useRemindEventAttendeesMutation({
    onError: () => addToast({ message: "Impossible d'envoyer la relance", variant: 'error' }),
  });

  const close = () => {
    setUnselectedIds(new Set());
    onClose();
  };

  const toggle = (attendeeId: AttendeeId) =>
    setUnselectedIds(current => {
      const next = new Set(current);
      if (next.has(attendeeId)) next.delete(attendeeId);
      else next.add(attendeeId);
      return next;
    });

  const sendReminder = async () => {
    const res = await remindAttendees({ eventId, attendeeIds: selectedIds });
    match(res.remindEventAttendees)
      .with({ __typename: 'RemindEventAttendeesOutput' }, ({ remindedCount }) => {
        addToast(
          remindedCount === 0
            ? {
                message: 'Personne à relancer : ces participants ont rempli leur liste ou ont déjà été relancés',
                variant: 'info',
              }
            : {
                message: `${remindedCount} ${remindedCount > 1 ? 'participants relancés' : 'participant relancé'} par email`,
                variant: 'success',
              },
        );
        void queryClient.invalidateQueries({ queryKey: ['EventAttendeesWithoutWishlist', { eventId }] });
        close();
      })
      .with({ __typename: 'BusinessRuleRejection', code: BusinessRuleCode.RateLimited }, () =>
        addToast({ message: REMINDERS_RATE_LIMITED_MESSAGE, variant: 'error' }),
      )
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Dialog onClose={close} open={open} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Relancer les participants</span>
          <IconButton onClick={close} aria-label="Fermer">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        {isLoading && (
          <LoadingBox>
            <CircularProgress size={32} />
          </LoadingBox>
        )}

        {!isLoading && attendees.length === 0 && (
          <EmptyState
            genieVariant="wishlist"
            title="Tout le monde a rempli sa liste 🎉"
            subtitle="Aucun participant à relancer pour le moment."
            sx={{ py: 2 }}
          />
        )}

        {!isLoading && attendees.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary">
              Ces participants n'ont pas encore ajouté d'idées de cadeaux pour cet évènement. Ils recevront un email
              pour les inviter à remplir leur liste.
            </Typography>
            <List dense>
              {attendees.map(attendee => {
                const checked = attendee.canBeReminded && !unselectedIds.has(attendee.id);
                const labelId = `remind-attendee-${attendee.id}`;

                return (
                  <ListItemButton
                    key={attendee.id}
                    disabled={!attendee.canBeReminded || isPending}
                    onClick={() => toggle(attendee.id)}
                    disableGutters
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        slotProps={{ input: { 'aria-labelledby': labelId } }}
                      />
                    </ListItemIcon>
                    <ListItemAvatar>
                      <Avatar src={attendee.user?.pictureUrl ?? undefined}>{attendeeInitials(attendee)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      id={labelId}
                      primary={<AttendeeName>{attendeeName(attendee)}</AttendeeName>}
                      secondary={attendeeStatus(attendee)}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="text" onClick={close} disabled={isPending}>
          {attendees.length === 0 ? 'Fermer' : 'Annuler'}
        </Button>
        {attendees.length > 0 && (
          <Button
            variant="contained"
            startIcon={<ForwardToInboxIcon />}
            onClick={sendReminder}
            disabled={selectedIds.length === 0}
            loading={isPending}
          >
            Relancer ({selectedIds.length})
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
