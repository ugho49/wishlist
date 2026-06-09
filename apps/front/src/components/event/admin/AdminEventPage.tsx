import type { AttendeeId, EventId, SecretSantaUserId } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined'
import SaveIcon from '@mui/icons-material/Save'
import { Alert, Box, Button, List, ListItem, ListItemIcon, ListItemText, Stack, TextField } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQueryClient } from '@tanstack/react-query'
import { ConfirmButton } from '@wishlist/front-components/common/ConfirmButton'
import { WishlistDatePicker } from '@wishlist/front-components/common/DatePicker'
import { EmojiSelectorWithBadge } from '@wishlist/front-components/common/EmojiSelectorWithBadge'
import { TextareaMarkdown } from '@wishlist/front-components/common/TextareaMarkdown'
import { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import z from 'zod'

import {
  AttendeeRole,
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useAdminDeleteEventAttendeeMutation,
  useAdminDeleteEventMutation,
  useAdminEventGetEventQuery,
  useAdminUpdateEventMutation,
  useCancelSecretSantaMutation,
  useDeleteSecretSantaMutation,
  useDeleteSecretSantaUserMutation,
  useStartSecretSantaMutation,
  useUpdateSecretSantaMutation,
} from '../../../gql'
import { useToast } from '../../../hooks'
import { useSecretSanta } from '../../../hooks/domain/useSecretSanta'
import { Card } from '../../common/Card'
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

interface AdminEventPageProps {
  eventId: EventId
}

export const AdminEventPage = ({ eventId }: AdminEventPageProps) => {
  const queryClient = useQueryClient()
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

  const { data, isLoading: loadingEvent } = useAdminEventGetEventQuery({ id: eventId }, { select: d => d.adminEvent })
  const event = data?.__typename === 'Event' ? data : undefined
  const queryRejection = data && isRejection(data) ? data : undefined

  const { secretSanta, loading: loadingSecretSanta } = useSecretSanta(eventId)

  const invalidateEvent = () => queryClient.invalidateQueries({ queryKey: ['AdminEventGetEvent', { id: eventId }] })
  const invalidateSecretSanta = () =>
    queryClient.invalidateQueries({ queryKey: ['GetSecretSantaForEvent', { eventId }] })

  const { mutateAsync: deleteAttendeeMutation, isPending: loadingDeleteAttendee } = useAdminDeleteEventAttendeeMutation(
    {
      onError: error => {
        addToast({ message: 'Impossible de supprimer ce participant', variant: 'error' })
        console.error(error)
      },
    },
  )

  const deleteAttendee = async (attendeeId: AttendeeId) => {
    const res = await deleteAttendeeMutation({ eventId, attendeeId })
    match(res.adminDeleteEventAttendee)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Participant supprimé avec succès', variant: 'success' })
        void invalidateEvent()
        void invalidateSecretSanta()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: deleteSecretSantaMutation, isPending: loadingDeleteSecretSanta } = useDeleteSecretSantaMutation({
    onError: () => addToast({ message: 'Impossible de supprimer le secret santa', variant: 'error' }),
  })

  const deleteSecretSanta = async () => {
    const res = await deleteSecretSantaMutation({ id: secretSanta!.id })
    match(res.deleteSecretSanta)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Secret santa supprimé avec succès', variant: 'success' })
        void invalidateSecretSanta()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: startSecretSantaMutation, isPending: loadingStartSecretSanta } = useStartSecretSantaMutation({
    onError: () => addToast({ message: 'Impossible de lancer le secret santa', variant: 'error' }),
  })

  const startSecretSanta = async () => {
    const res = await startSecretSantaMutation({ id: secretSanta!.id })
    match(res.startSecretSanta)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Secret santa lancé avec succès', variant: 'success' })
        void invalidateSecretSanta()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: cancelSecretSantaMutation, isPending: loadingCancelSecretSanta } = useCancelSecretSantaMutation({
    onError: () => addToast({ message: "Impossible d'annuler le secret santa", variant: 'error' }),
  })

  const cancelSecretSanta = async () => {
    const res = await cancelSecretSantaMutation({ id: secretSanta!.id })
    match(res.cancelSecretSanta)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Secret santa annulé avec succès', variant: 'success' })
        void invalidateSecretSanta()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: removeSecretSantaUserMutation, isPending: loadingRemoveSecretSantaUser } =
    useDeleteSecretSantaUserMutation({
      onError: () => addToast({ message: "Impossible de supprimer l'utilisateur du secret santa", variant: 'error' }),
    })

  const removeSecretSantaUser = async (secretSantaUserId: SecretSantaUserId) => {
    const res = await removeSecretSantaUserMutation({ id: secretSanta!.id, secretSantaUserId })
    match(res.deleteSecretSantaUser)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Utilisateur supprimé du secret santa avec succès', variant: 'success' })
        void invalidateSecretSanta()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: updateSecretSantaMutation, isPending: loadingUpdateSecretSanta } = useUpdateSecretSantaMutation({
    onError: () => addToast({ message: 'Impossible de modifier le secret santa', variant: 'error' }),
  })

  const updateSecretSanta = async (input: { budget?: number; description?: string }) => {
    const res = await updateSecretSantaMutation({ id: secretSanta!.id, input })
    match(res.updateSecretSanta)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Secret santa modifié avec succès', variant: 'success' })
        void invalidateSecretSanta()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: updateEventMutation, isPending: loadingUpdateEvent } = useAdminUpdateEventMutation({
    onError: () => addToast({ message: "Impossible de modifier l'évènement", variant: 'error' }),
  })

  const { mutateAsync: deleteEventMutation, isPending: loadingDeleteEvent } = useAdminDeleteEventMutation({
    onError: error => {
      addToast({ message: "Impossible de supprimer l'évènement", variant: 'error' })
      console.error(error)
    },
  })

  const deleteEvent = async () => {
    const res = await deleteEventMutation({ id: eventId })
    match(res.adminDeleteEvent)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Évènement supprimé avec succès', variant: 'success' })
        void invalidateEvent()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const maintainerName = useMemo(() => {
    if (!event) return ''
    const user = event.attendees.find(attendee => attendee.role === AttendeeRole.Maintainer)
    if (!user) return ''
    return `${user.user?.firstName} ${user.user?.lastName}`
  }, [event])

  useEffect(() => {
    if (event) {
      setValue('title', event.title)
      setValue('description', event.description ?? undefined)
      setValue('eventDate', DateTime.fromISO(event.eventDate))
      setValue('icon', event.icon ?? undefined)
    }
  }, [event, setValue])

  const onSubmit = async (data: FormFields) => {
    const isoDate = data.eventDate!.toISODate()!
    const res = await updateEventMutation({
      id: eventId,
      input: {
        title: data.title,
        description: data.description === '' ? undefined : data.description,
        icon: data.icon,
        eventDate: isoDate,
      },
    })
    match(res.adminUpdateEvent)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Évènement modifié avec succès', variant: 'success' })
        void invalidateEvent()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
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
      <Title>Editer l'évènement</Title>

      <CardStack>
        {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}
        <Card>
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
                    secondary={DateTime.fromISO(event?.createdAt || '').toLocaleString(
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
        </Card>

        <Card>
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
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextareaMarkdown
                    label="Description"
                    autoComplete="off"
                    fullWidth
                    maxLength={2000}
                    placeholder="Une petite description  ..."
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={loadingEdit}
                  />
                )}
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
        </Card>

        <Card>
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
        </Card>

        <Card>
          <Loader loading={loadingEvent}>
            <Subtitle>Participants ({event?.attendees.length})</Subtitle>
            <AdminListAttendees
              attendees={event?.attendees ?? []}
              loading={loadingEdit}
              deleteAttendee={attendeeId => deleteAttendee(attendeeId)}
            />
          </Loader>
        </Card>

        <Card>
          <Loader loading={loadingEvent}>
            <Subtitle>Wishlists ({event?.wishlists.length})</Subtitle>
            <AdminListWishlistsForEvent wishlists={event?.wishlists ?? []} />
          </Loader>
        </Card>
      </CardStack>
    </Box>
  )
}
