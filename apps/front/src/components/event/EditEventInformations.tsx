import type { DetailedEventDto, UpdateEventInputDto } from '@wishlist/common'
import type { FormEvent } from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { CardV2 } from '../common/CardV2'
import { CharsRemaining } from '../common/CharsRemaining'
import { ConfirmButton } from '../common/ConfirmButton'
import { WishlistDatePicker } from '../common/DatePicker'
import { EmojiSelectorWithBadge } from '../common/EmojiSelectorWithBadge'
import { Subtitle } from '../common/Subtitle'

export type EditEventInformationsProps = {
  event: DetailedEventDto
}

export const EditEventInformations = ({ event }: EditEventInformationsProps) => {
  const api = useApi()
  const { addToast } = useToast()
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description)
  const [icon, setIcon] = useState<string | undefined>(event.icon)
  const [eventDate, setEventDate] = useState<DateTime | null>(DateTime.fromISO(event.event_date))
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const updateEnabled = title.trim() !== '' && eventDate !== null

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const isoDate = eventDate?.toISODate() || DateTime.now().toISODate() || ''
    const body: UpdateEventInputDto = {
      title,
      description: description === '' ? undefined : description,
      icon,
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
      <CardV2 component="form" onSubmit={onSubmit}>
        <Subtitle>Modifier les informations</Subtitle>

        <Stack gap={4}>
          <Stack direction="row" gap={2} alignItems="flex-start">
            <EmojiSelectorWithBadge value={icon} onChange={setIcon} disabled={loading} />
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Titre"
                autoComplete="off"
                disabled={loading}
                fullWidth
                required
                value={title}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                placeholder="Le titre de votre évènement"
                helperText={<CharsRemaining max={100} value={title} />}
                onChange={e => setTitle(e.target.value)}
              />
            </Box>
          </Stack>

          <Box>
            <TextField
              label="Description"
              autoComplete="off"
              disabled={loading}
              fullWidth
              multiline
              minRows={4}
              value={description}
              slotProps={{ htmlInput: { maxLength: 2000 } }}
              placeholder="Une petite description ..."
              helperText={<CharsRemaining max={2000} value={description} />}
              onChange={e => setDescription(e.target.value)}
            />
          </Box>

          <Stack>
            <WishlistDatePicker
              label="Date de l'évènement"
              format="DDDD"
              value={eventDate}
              disabled={loading}
              onChange={date => setEventDate(date)}
              disablePast
            />
          </Stack>

          <Stack direction="row" justifyContent="center" marginTop={4}>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              loading={loading}
              loadingPosition="start"
              disabled={loading || !updateEnabled}
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
