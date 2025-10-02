import type { AttendeeId, EventId, SecretSantaUserId, UpdateSecretSantaInputDto } from '@wishlist/common'
import type { AxiosError } from 'axios'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined'
import NumbersIcon from '@mui/icons-material/Numbers'
import ShortTextIcon from '@mui/icons-material/ShortText'
import TitleIcon from '@mui/icons-material/Title'
import { Box, List, ListItem, ListItemIcon, ListItemText, Stack } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AttendeeRole } from '@wishlist/common'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

import { useApi, useToast } from '../../../hooks'
import { Route } from '../../../routes/_authenticated/admin.events.$eventId'
import { BreaklineText } from '../../common/BreaklineText'
import { CardV2 } from '../../common/CardV2'
import { Loader } from '../../common/Loader'
import { Subtitle } from '../../common/Subtitle'
import { Title } from '../../common/Title'
import { AdminSecretSanta } from '../../secret-santa/admin/AdminSecretSanta'
import { AdminListWishlistsForEvent } from '../../wishlist/admin/AdminListWishlistsForEvent'
import { AdminListAttendees } from './AdminListAttendees'

const CardStack = styled(Stack)(() => ({
  gap: 32,
}))

export const AdminEventPage = () => {
  const { eventId } = Route.useParams()
  const queryClient = useQueryClient()
  const { admin: api } = useApi()
  const { addToast } = useToast()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['admin', 'event', { eventId }],
    queryFn: ({ signal }) => api.event.getById(eventId, { signal }),
  })

  const { data: secretSanta, isLoading: loadingSecretSanta } = useQuery({
    queryKey: ['admin', 'secret-santa', { eventId }],
    queryFn: ({ signal }) => api.secretSanta.get(eventId, { signal }),
  })

  const { mutateAsync: deleteAttendee, isPending: loadingDeleteAttendee } = useMutation({
    mutationKey: ['admin', 'event.deleteAttendee', { eventId }],
    mutationFn: (attendeeId: AttendeeId) => api.eventAttendee.deleteAttendee({ eventId, attendeeId }),
    onSuccess: () => {
      addToast({ message: 'Participant supprimé avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', { eventId }] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'secret-santa', { eventId }] })
    },
    onError: error => {
      const axiosError = error as AxiosError<{ message: string }>
      addToast({ message: axiosError.response?.data.message, variant: 'error' })
      console.error(error)
    },
  })

  const { mutateAsync: deleteSecretSanta, isPending: loadingDeleteSecretSanta } = useMutation({
    mutationKey: ['admin', 'secret-santa.delete', { secretSantaId: secretSanta?.id }],
    mutationFn: () => api.secretSanta.delete(secretSanta!.id),
    onSuccess: () => {
      addToast({ message: 'Secret santa supprimé avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'secret-santa', { eventId }] })
    },
    onError: () => addToast({ message: 'Impossible de supprimer le secret santa', variant: 'error' }),
  })

  const { mutateAsync: startSecretSanta, isPending: loadingStartSecretSanta } = useMutation({
    mutationKey: ['admin', 'secret-santa.start', { secretSantaId: secretSanta?.id }],
    mutationFn: () => api.secretSanta.start(secretSanta!.id),
    onSuccess: () => {
      addToast({ message: 'Secret santa lancé avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'secret-santa', { eventId }] })
    },
    onError: () => addToast({ message: 'Impossible de lancer le secret santa', variant: 'error' }),
  })

  const { mutateAsync: cancelSecretSanta, isPending: loadingCancelSecretSanta } = useMutation({
    mutationKey: ['admin', 'secret-santa.cancel', { secretSantaId: secretSanta?.id }],
    mutationFn: () => api.secretSanta.cancel(secretSanta!.id),
    onSuccess: () => {
      addToast({ message: 'Secret santa annulé avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'secret-santa', { eventId }] })
    },
    onError: () => addToast({ message: "Impossible d'annuler le secret santa", variant: 'error' }),
  })

  const { mutateAsync: removeSecretSantaUser, isPending: loadingRemoveSecretSantaUser } = useMutation({
    mutationKey: ['admin', 'secret-santa.removeUser', { secretSantaId: secretSanta?.id }],
    mutationFn: (secretSantaUserId: SecretSantaUserId) =>
      api.secretSanta.deleteUser(secretSanta!.id, secretSantaUserId),
    onSuccess: () => {
      addToast({ message: 'Utilisateur supprimé du secret santa avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'secret-santa', { eventId }] })
    },
    onError: () => addToast({ message: "Impossible de supprimer l'utilisateur du secret santa", variant: 'error' }),
  })

  const { mutateAsync: updateSecretSanta, isPending: loadingUpdateSecretSanta } = useMutation({
    mutationKey: ['admin', 'secret-santa.update', { secretSantaId: secretSanta?.id }],
    mutationFn: (input: UpdateSecretSantaInputDto) => api.secretSanta.update(secretSanta!.id, input),
    onSuccess: () => {
      addToast({ message: 'Secret santa modifié avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'secret-santa', { eventId }] })
    },
    onError: () => addToast({ message: 'Impossible de modifier le secret santa', variant: 'error' }),
  })

  const maintainerName = useMemo(() => {
    if (!event) return ''
    const user = event.attendees.find(attendee => attendee.role === AttendeeRole.MAINTAINER)
    if (!user) return ''
    return `${user.user?.firstname} ${user.user?.lastname}`
  }, [event])

  const loadingEdit =
    loadingDeleteSecretSanta ||
    loadingStartSecretSanta ||
    loadingCancelSecretSanta ||
    loadingRemoveSecretSantaUser ||
    loadingUpdateSecretSanta ||
    loadingDeleteAttendee

  return (
    <Box>
      <Title smallMarginBottom>Editer l'évènement</Title>

      <CardStack>
        <CardV2>
          <Loader loading={loadingEvent}>
            <Subtitle>Détails</Subtitle>
            <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
              <List dense sx={{ flexGrow: 1 }}>
                <ListItem>
                  <ListItemIcon>
                    <TitleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Titre" secondary={event?.title} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NumbersIcon />
                  </ListItemIcon>
                  <ListItemText primary="Nombre de participants" secondary={event?.attendees.length} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalPoliceOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Maintenu par" secondary={maintainerName} />
                </ListItem>
              </List>

              <List dense sx={{ flexGrow: 1 }}>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Créé le"
                    secondary={DateTime.fromISO(event?.created_at || '').toLocaleString(
                      DateTime.DATETIME_MED_WITH_SECONDS,
                    )}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NumbersIcon />
                  </ListItemIcon>
                  <ListItemText primary="Nombre de listes" secondary={event?.wishlists.length} />
                </ListItem>
              </List>
            </Stack>
            {event?.description && (
              <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
                <List dense sx={{ flexGrow: 1 }}>
                  <ListItem>
                    <ListItemIcon>
                      <ShortTextIcon />
                    </ListItemIcon>
                    <ListItemText primary="Description" secondary={<BreaklineText text={event?.description ?? ''} />} />
                  </ListItem>
                </List>
              </Stack>
            )}
          </Loader>
        </CardV2>

        <CardV2>
          <Loader loading={loadingSecretSanta}>
            <Subtitle>Secret Santa</Subtitle>
            {secretSanta && (
              <AdminSecretSanta
                secretSanta={secretSanta}
                loading={loadingEdit}
                startSecretSanta={() => startSecretSanta()}
                updateSecretSanta={input => updateSecretSanta(input)}
                cancelSecretSanta={() => cancelSecretSanta()}
                deleteSecretSanta={() => deleteSecretSanta()}
                removeSecretSantaUser={secretSantaUserId => removeSecretSantaUser(secretSantaUserId)}
              />
            )}
            {!secretSanta && <div>Il n'y a pas de secret santa pour cet évènement</div>}
          </Loader>
        </CardV2>

        <CardV2>
          <Loader loading={loadingEvent}>
            <Subtitle>Participants ({event?.attendees.length})</Subtitle>
            <AdminListAttendees
              attendees={event?.attendees ?? []}
              loading={loadingEdit}
              deleteAttendee={attendeeId => deleteAttendee(attendeeId)}
            />
          </Loader>
        </CardV2>

        <CardV2>
          <Loader loading={loadingEvent}>
            <Subtitle>Wishlists ({event?.wishlists.length})</Subtitle>
            <AdminListWishlistsForEvent wishlists={event?.wishlists ?? []} />
          </Loader>
        </CardV2>
      </CardStack>
    </Box>
  )
}
