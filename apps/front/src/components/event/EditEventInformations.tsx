import type { DetailedEventDto, UpdateEventInputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { CardV2 } from '../common/CardV2'
import { CharsRemaining } from '../common/CharsRemaining'
import { ConfirmButton } from '../common/ConfirmButton'
import { WishlistDatePicker } from '../common/DatePicker'
import { EmojiSelectorWithBadge } from '../common/EmojiSelectorWithBadge'
import { Subtitle } from '../common/Subtitle'

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

export type EditEventInformationsProps = {
  event: DetailedEventDto
}

export const EditEventInformations = ({ event }: EditEventInformationsProps) => {
  const api = useApi()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event.title,
      description: event.description || '',
      eventDate: DateTime.fromISO(event.event_date),
      icon: event.icon,
    },
  })

  const formValues = watch()

  const { mutateAsync: updateEvent, isPending: loading } = useMutation({
    mutationKey: ['event.update', { id: event.id }],
    mutationFn: (data: UpdateEventInputDto) => api.event.update(event.id, data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_output, data) => {
      addToast({ message: 'Évènement mis à jour', variant: 'info' })

      queryClient.setQueryData(['event', { id: event.id }], (old: DetailedEventDto) => ({
        ...old,
        ...data,
        event_date: data.event_date.toISOString(),
      }))
    },
  })

  const { mutateAsync: handleDelete } = useMutation({
    mutationKey: ['event.delete', { id: event.id }],
    mutationFn: () => api.event.delete(event.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

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

  const deleteEvent = async () => {
    try {
      await handleDelete()
      addToast({ message: "L'évènement à bien été supprimée", variant: 'success' })
      navigate('/events')
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

  return (
    <Stack gap={3}>
      <CardV2 component="form" onSubmit={handleSubmit(onSubmit)}>
        <Subtitle>Modifier les informations</Subtitle>

        <Stack gap={4}>
          <Stack direction="row" gap={2} alignItems="flex-start">
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
                disabled={loading}
                fullWidth
                placeholder="Le titre de votre évènement"
                error={!!errors.title}
                helperText={errors.title?.message || <CharsRemaining max={100} value={formValues.title || ''} />}
              />
            </Box>
          </Stack>

          <Box>
            <TextField
              {...register('description')}
              label="Description"
              autoComplete="off"
              disabled={loading}
              fullWidth
              multiline
              minRows={4}
              placeholder="Une petite description ..."
              error={!!errors.description}
              helperText={
                errors.description?.message || <CharsRemaining max={2000} value={formValues.description || ''} />
              }
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
                  disabled={loading}
                  onChange={date => field.onChange(date)}
                  disablePast
                  fullWidth
                  error={!!errors.eventDate}
                  helperText={errors.eventDate?.message}
                />
              )}
            />
          </Stack>

          <Stack direction="row" justifyContent="center" marginTop={4}>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              loading={loading}
              loadingPosition="start"
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              Mettre à jour
            </Button>
          </Stack>
        </Stack>
      </CardV2>

      <Stack alignItems="center">
        <Box>
          <ConfirmButton
            confirmTitle="Supprimer l'évènement"
            confirmText={
              <span>
                Etes vous sûr de supprimer l'évènement <b>{event.title}</b> ? Cela supprimera toutes les listes associés
                !
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
        </Box>
      </Stack>
    </Stack>
  )
}
