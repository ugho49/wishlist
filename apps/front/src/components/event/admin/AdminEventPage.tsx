import type {
  AttendeeId,
  EventId,
  SecretSantaUserId,
  UpdateEventInputDto,
  UpdateSecretSantaInputDto,
} from '@wishlist/common'
import type { AxiosError } from 'axios'

import { zodResolver } from '@hookform/resolvers/zod'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Stack, TextField } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AttendeeRole } from '@wishlist/common'
import { ConfirmButton } from '@wishlist/front-components/common/ConfirmButton'
import { WishlistDatePicker } from '@wishlist/front-components/common/DatePicker'
import { EmojiSelectorWithBadge } from '@wishlist/front-components/common/EmojiSelectorWithBadge'
import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import z from 'zod'

import { useApi, useToast } from '../../../hooks'
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

const schema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1, 'Le titre est requis').max(100, '100 caractères maximum'),
  description: z.string().max(2000, '2000 caractères maximum').optional(),
  eventDate: z
    .custom<DateTime>()
    .nullable()
    .refine(date => date !== null, "La date de l'événement est requise"),
})

type FormFields = z.infer<typeof schema>

export const AdminEventPage = () => {
  const params = useParams<'eventId'>()
  const eventId = (params.eventId || '') as EventId
  const queryClient = useQueryClient()
  const { admin: api } = useApi()
  const { addToast } = useToast()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  })

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

  const { mutateAsync: updateEvent, isPending: loadingUpdateEvent } = useMutation({
    mutationKey: ['admin', 'event.update', { eventId }],
    mutationFn: (input: UpdateEventInputDto) => api.event.update(eventId, input),
    onSuccess: () => {
      addToast({ message: 'Évènement modifié avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', { eventId }] })
    },
    onError: () => addToast({ message: "Impossible de modifier l'évènement", variant: 'error' }),
  })

  const { mutateAsync: deleteEvent, isPending: loadingDeleteEvent } = useMutation({
    mutationKey: ['admin', 'event.delete', { eventId }],
    mutationFn: () => api.event.delete(eventId),
    onSuccess: () => {
      addToast({ message: 'Évènement supprimé avec succès', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', { eventId }] })
    },
    onError: error => {
      const axiosError = error as AxiosError<{ message: string }>
      addToast({
        message: `Impossible de supprimer l'évènement: ${axiosError.response?.data.message}`,
        variant: 'error',
      })
    },
  })

  const maintainerName = useMemo(() => {
    if (!event) return ''
    const user = event.attendees.find(attendee => attendee.role === AttendeeRole.MAINTAINER)
    if (!user) return ''
    return `${user.user?.firstname} ${user.user?.lastname}`
  }, [event])

  useEffect(() => {
    if (event) {
      setValue('title', event.title)
      setValue('description', event.description)
      setValue('eventDate', DateTime.fromISO(event.event_date))
      setValue('icon', event.icon)
    }
  }, [event, setValue])

  const onSubmit = async (data: FormFields) => {
    const isoDate = data.eventDate!.toISODate()!
    const body: UpdateEventInputDto = {
      title: data.title,
      description: data.description === '' ? undefined : data.description,
      icon: data.icon,
      event_date: new Date(isoDate),
    }
    await updateEvent(body)
  }

  const loadingEdit =
    loadingDeleteSecretSanta ||
    loadingStartSecretSanta ||
    loadingCancelSecretSanta ||
    loadingRemoveSecretSantaUser ||
    loadingUpdateSecretSanta ||
    loadingDeleteAttendee ||
    loadingUpdateEvent ||
    loadingDeleteEvent

  return (
    <Box>
      <Title smallMarginBottom>Editer l'évènement</Title>

      <CardStack>
        <CardV2>
          <Loader loading={loadingEvent}>
            <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
              <List dense sx={{ flexGrow: 1 }}>
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
              </List>

              <Stack sx={{ flexGrow: 1 }} alignItems="center" justifyContent="center">
                <ConfirmButton
                  confirmTitle="Supprimer l'évènement"
                  confirmText="Etes vous sûr de supprimer l'évènement ? Cela supprimera toutes les listes associés !"
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteEvent()}
                >
                  Supprimer l'évènement
                </ConfirmButton>
              </Stack>
            </Stack>
          </Loader>
        </CardV2>

        <CardV2>
          <Subtitle>Modifier les informations</Subtitle>

          <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
            <Stack direction="row" gap={3} alignItems="flex-start">
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <EmojiSelectorWithBadge value={field.value} onChange={value => field.onChange(value)} />
                )}
              />
              <Box sx={{ flex: 1 }}>
                <TextField
                  {...register('title')}
                  label="Titre"
                  autoComplete="off"
                  disabled={loadingEdit}
                  fullWidth
                  placeholder="Le titre de votre évènement"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Box>
            </Stack>

            <Box>
              <TextField
                {...register('description')}
                label="Description"
                autoComplete="off"
                disabled={loadingEdit}
                fullWidth
                multiline
                minRows={4}
                placeholder="Une petite description ..."
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Box>

            <Stack>
              <Controller
                control={control}
                name="eventDate"
                render={({ field }) => (
                  <WishlistDatePicker
                    label="Date de l'évènement"
                    format="DDDD"
                    value={field.value}
                    inputRef={field.ref}
                    disabled={loadingEdit}
                    onChange={date => field.onChange(date)}
                    disablePast
                    fullWidth
                    error={!!errors.eventDate}
                    helperText={errors.eventDate?.message}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" justifyContent="center">
              <Button
                sx={{ marginTop: '8px' }}
                type="submit"
                variant="contained"
                size="small"
                loading={loadingEdit}
                loadingPosition="start"
                disabled={loadingEdit}
                startIcon={<SaveIcon />}
              >
                Mettre à jour
              </Button>
            </Stack>
          </Stack>
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
