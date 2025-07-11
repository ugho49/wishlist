import type { DetailedEventDto, UpdateEventInputDto } from '@wishlist/common'
import type { FormEvent } from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { CharsRemaining } from '../common/CharsRemaining'
import { ConfirmButton } from '../common/ConfirmButton'
import { InputLabel } from '../common/InputLabel'

export type EditEventInformationsProps = {
  event: DetailedEventDto
}

export const EditEventInformations = ({ event }: EditEventInformationsProps) => {
  const api = useApi()
  const { addToast } = useToast()
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description)
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
      <Card>
        <Stack component="form" onSubmit={onSubmit} gap={3}>
          <Box>
            <InputLabel required>Titre</InputLabel>
            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              required
              value={title}
              inputProps={{ maxLength: 100 }}
              placeholder="La titre de votre évènement"
              helperText={<CharsRemaining max={100} value={title} />}
              onChange={e => setTitle(e.target.value)}
            />
          </Box>

          <Box>
            <InputLabel>Description</InputLabel>
            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              multiline
              minRows={4}
              value={description}
              inputProps={{ maxLength: 2000 }}
              placeholder="Une petite description ..."
              helperText={<CharsRemaining max={2000} value={description} />}
              onChange={e => setDescription(e.target.value)}
            />
          </Box>

          <Stack>
            <InputLabel required>Date de l'évènement</InputLabel>
            <MobileDatePicker
              format="DDDD"
              value={eventDate}
              disabled={loading}
              onChange={date => setEventDate(date)}
              disablePast={true}
            />
          </Stack>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="secondary"
            loading={loading}
            loadingPosition="start"
            disabled={loading || !updateEnabled}
            startIcon={<SaveIcon />}
          >
            Mettre à jour
          </Button>
        </Stack>
      </Card>
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
