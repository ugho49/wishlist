import React, { useMemo, useState } from 'react';
import { MAX_EVENTS_BY_LIST, MiniEventDto } from '@wishlist/common-types';
import { Card } from '../common/Card';
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateTime } from 'luxon';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { SearchEventSelect } from '../event/SearchEventSelect';
import { useAsync } from 'react-use';
import { InputLabel } from '../common/InputLabel';

export type EditWishlistEventsProps = {
  wishlistId: string;
  events: MiniEventDto[];
  onChange: (events: MiniEventDto[]) => void;
};

export const EditWishlistEvent = ({ wishlistId, events, onChange }: EditWishlistEventsProps) => {
  const api = useApi(wishlistApiRef);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { value } = useAsync(() => api.event.getAll({ limit: 100, only_future: true }), []);
  const availableEvents = useMemo(() => value?.resources || [], [value]);

  const attacheEventToWishlist = async (event: MiniEventDto) => {
    setLoading(true);

    try {
      await api.wishlist.linkWishlistToAnEvent(wishlistId, { event_id: event.id });
      onChange([event, ...events]);
      addToast({ message: 'La liaison entre cette liste et cet évènement à été ajoutée !', variant: 'info' });
    } catch (e) {
      addToast({ message: "Impossible d'ajouter la liaison entre cette liste et cet évènement", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const detachEventFromWishlist = async (event: MiniEventDto) => {
    setLoading(true);

    try {
      await api.wishlist.unlinkWishlistToAnEvent(wishlistId, { event_id: event.id });
      onChange([...events].filter((e) => e.id !== event.id));
      addToast({ message: 'La liaison entre cette liste et cet évènement à été supprimée !', variant: 'info' });
    } catch (e) {
      addToast({ message: 'Impossible de supprimer la liaison entre cette liste et cet évènement', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Box>
        <InputLabel>Ajouter un nouvel évènement sur la liste ?</InputLabel>

        <SearchEventSelect
          options={availableEvents}
          disabled={loading || events.length === MAX_EVENTS_BY_LIST}
          onChange={(value) => attacheEventToWishlist(value)}
          excludedEventIds={events.map((e) => e.id)}
        />
      </Box>

      <Divider sx={{ marginBlock: '20px' }} />

      <List sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.map((event) => (
          <Card variant="outlined" sx={{ padding: 0 }} key={event.id}>
            <ListItem
              secondaryAction={
                <ConfirmIconButton
                  confirmTitle="Séparer cette liste et cet évènement ?"
                  confirmText={
                    <>
                      Êtes-vous sur de supprimer la liaison entre cette liste et l'évènement <b>{event.title}</b> ?
                    </>
                  }
                  onClick={() => detachEventFromWishlist(event)}
                  disabled={loading || events.length === 1}
                >
                  <DeleteIcon />
                </ConfirmIconButton>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.secondary.dark, color: theme.palette.background.paper }}>
                  <CalendarMonthIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={event.title}
                secondary={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
              />
            </ListItem>
          </Card>
        ))}
      </List>
    </Stack>
  );
};
