import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DeleteIcon from '@mui/icons-material/Delete'
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack, useTheme } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DetailedWishlistDto, MAX_EVENTS_BY_LIST, MiniEventDto } from '@wishlist/common-types'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import { useAvailableEvents } from '../../hooks/domain/useAvailableEvents'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { ConfirmIconButton } from '../common/ConfirmIconButton'
import { InputLabel } from '../common/InputLabel'
import { SearchEventSelect } from '../event/SearchEventSelect'

export type EditWishlistEventsProps = {
  wishlistId: string
  events: MiniEventDto[]
}

export const EditWishlistEvent = ({ wishlistId, events }: EditWishlistEventsProps) => {
  const api = useApi()
  const theme = useTheme()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const { events: availableEvents, loading: availableEventsLoading } = useAvailableEvents()

  const { mutateAsync: attachEventToWishlist, isPending: attachEventToWishlistPending } = useMutation({
    mutationKey: ['wishlist.linkEvent', { id: wishlistId }],
    mutationFn: (event: MiniEventDto) => api.wishlist.linkWishlistToAnEvent(wishlistId, { event_id: event.id }),
    onSuccess: (_output, event) => {
      addToast({ message: 'La liaison entre cette liste et cet évènement à été ajoutée !', variant: 'info' })

      queryClient.setQueryData(['wishlist', { id: wishlistId }], (old: DetailedWishlistDto) => ({
        ...old,
        events: [event, ...old.events],
      }))
    },
    onError: () =>
      addToast({ message: "Impossible d'ajouter la liaison entre cette liste et cet évènement", variant: 'error' }),
  })

  const { mutateAsync: detachEventFromWishlist, isPending: detachEventFromWishlistPending } = useMutation({
    mutationKey: ['wishlist.unlinkEvent', { id: wishlistId }],
    mutationFn: (event: MiniEventDto) => api.wishlist.unlinkWishlistToAnEvent(wishlistId, { event_id: event.id }),
    onSuccess: (_output, event) => {
      addToast({ message: 'La liaison entre cette liste et cet évènement à été supprimée !', variant: 'info' })

      queryClient.setQueryData(['wishlist', { id: wishlistId }], (old: DetailedWishlistDto) => ({
        ...old,
        events: [...events].filter(e => e.id !== event.id),
      }))
    },
    onError: () =>
      addToast({ message: 'Impossible de supprimer la liaison entre cette liste et cet évènement', variant: 'error' }),
  })

  const loading = useMemo(
    () => attachEventToWishlistPending || detachEventFromWishlistPending,
    [attachEventToWishlistPending, detachEventFromWishlistPending],
  )

  return (
    <Stack>
      <Box>
        <InputLabel>Ajouter un nouvel évènement sur la liste ?</InputLabel>

        <SearchEventSelect
          loading={availableEventsLoading}
          error={events.length === MAX_EVENTS_BY_LIST}
          options={availableEvents}
          disabled={loading || events.length === MAX_EVENTS_BY_LIST}
          onChange={value => attachEventToWishlist(value)}
          excludedEventIds={events.map(e => e.id)}
        />
      </Box>

      <Divider sx={{ marginBlock: '20px' }} />

      <List sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.map(event => (
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
                primary={<b>{event.title}</b>}
                secondary={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
              />
            </ListItem>
          </Card>
        ))}
      </List>
    </Stack>
  )
}
