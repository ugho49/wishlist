import type { EventId, WishlistId } from '@wishlist/common';
import type { WishlistEvent } from './wishlist.types';

import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { MAX_EVENTS_BY_LIST } from '@wishlist/common';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { match } from 'ts-pattern';

import {
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useEventSelectAvailableEventsQuery,
  useLinkWishlistToEventMutation,
  useUnlinkWishlistFromEventMutation,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { Card } from '../common/Card';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import { InputLabel } from '../common/InputLabel';
import { Subtitle } from '../common/Subtitle';
import { EventIcon } from '../event/EventIcon';
import { SearchEventSelect } from '../event/SearchEventSelect';

export type EditWishlistEventsProps = {
  wishlistId: WishlistId;
  events: WishlistEvent[];
};

export const EditWishlistEvent = ({ wishlistId, events }: EditWishlistEventsProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data: availableEventsData, isLoading: availableEventsLoading } = useEventSelectAvailableEventsQuery(
    { filters: { limit: 100, onlyFuture: true } },
    { select: d => d.events },
  );
  const availableEvents =
    availableEventsData?.__typename === 'GetEventsPagedResponse' ? availableEventsData.data : undefined;
  const availableEventsRejection =
    availableEventsData && isRejection(availableEventsData) ? availableEventsData : undefined;

  const invalidateWishlist = () => queryClient.invalidateQueries({ queryKey: ['WishlistPage', { wishlistId }] });

  const { mutateAsync: attachEventToWishlistMutation, isPending: attachEventToWishlistPending } =
    useLinkWishlistToEventMutation({
      onError: () =>
        addToast({ message: "Impossible d'ajouter la liaison entre cette liste et cet évènement", variant: 'error' }),
    });

  const { mutateAsync: detachEventFromWishlistMutation, isPending: detachEventFromWishlistPending } =
    useUnlinkWishlistFromEventMutation({
      onError: () =>
        addToast({
          message: 'Impossible de supprimer la liaison entre cette liste et cet évènement',
          variant: 'error',
        }),
    });

  const attachEventToWishlist = async (eventId: EventId) => {
    const res = await attachEventToWishlistMutation({ id: wishlistId, eventId });
    match(res.linkWishlistToEvent)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'La liaison entre cette liste et cet évènement à été ajoutée !', variant: 'info' });
        void invalidateWishlist();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const detachEventFromWishlist = async (eventId: EventId) => {
    const res = await detachEventFromWishlistMutation({ id: wishlistId, eventId });
    match(res.unlinkWishlistFromEvent)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'La liaison entre cette liste et cet évènement à été supprimée !', variant: 'info' });
        void invalidateWishlist();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const loading = useMemo(
    () => attachEventToWishlistPending || detachEventFromWishlistPending,
    [attachEventToWishlistPending, detachEventFromWishlistPending],
  );

  return (
    <Card>
      <Subtitle>Modifier les évènements associés</Subtitle>

      <Box>
        <InputLabel>Ajouter un nouvel évènement sur la liste ?</InputLabel>

        {availableEventsRejection && (
          <Alert severity="error" sx={{ marginBottom: '15px' }}>
            {rejectionMessage(availableEventsRejection)}
          </Alert>
        )}

        <SearchEventSelect
          loading={availableEventsLoading}
          error={events.length === MAX_EVENTS_BY_LIST}
          options={availableEvents ?? []}
          disabled={loading || events.length === MAX_EVENTS_BY_LIST}
          onChange={value => attachEventToWishlist(value.id)}
          excludedEventIds={events.map(e => e.id)}
        />
      </Box>

      <Divider sx={{ marginBlock: '20px' }} />

      <List>
        {events.map(event => (
          <ListItem
            key={event.id}
            className="animated zoomIn fast"
            disablePadding
            secondaryAction={
              <ConfirmIconButton
                confirmTitle="Séparer cette liste et cet évènement ?"
                confirmText={
                  <>
                    Êtes-vous sur de supprimer la liaison entre cette liste et l'évènement <b>{event.title}</b> ?
                  </>
                }
                onClick={() => detachEventFromWishlist(event.id)}
                disabled={loading || events.length === 1}
              >
                <DeleteIcon />
              </ConfirmIconButton>
            }
          >
            <ListItemButton>
              <ListItemAvatar>
                <EventIcon icon={event.icon ?? undefined} />
              </ListItemAvatar>
              <ListItemText
                primary={<b>{event.title}</b>}
                secondary={DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATE_MED)}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};
