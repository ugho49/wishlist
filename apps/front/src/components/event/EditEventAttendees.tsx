import type { AddEventAttendeeInputDto, AttendeeDto, DetailedEventDto, EventId } from '@wishlist/common'

import type { RootState } from '../../core'

import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Divider, List, ListItem, ListItemButton, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AttendeeRole } from '@wishlist/common'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useApi, useToast } from '../../hooks'
import { CardV2 } from '../common/CardV2'
import { ConfirmIconButton } from '../common/ConfirmIconButton'
import { InputLabel } from '../common/InputLabel'
import { SearchUserSelect } from '../user/SearchUserSelect'
import { ListItemAttendee } from './ListItemAttendee'

export type EditEventAttendeesProps = {
  eventId: EventId
  attendees: AttendeeDto[]
}

const mapState = (state: RootState) => ({ email: state.auth.user?.email, id: state.auth.user?.id })

export const EditEventAttendees = ({ eventId, attendees }: EditEventAttendeesProps) => {
  const { id: currentUserId, email: currentUserEmail } = useSelector(mapState)
  const api = useApi()
  const { addToast } = useToast()

  const attendeeEmails = useMemo(
    () => attendees.map(attendee => (attendee.pending_email ? attendee.pending_email : attendee.user?.email || '')),
    [attendees],
  )

  const queryClient = useQueryClient()

  const { mutateAsync: addAttendee, isPending: addAttendeePending } = useMutation({
    mutationKey: ['event.addAttendee', { id: eventId }],
    mutationFn: (attendee: AddEventAttendeeInputDto) =>
      api.attendee.addAttendee(eventId, {
        email: attendee.email,
        role: attendee.role,
      }),
    onSuccess: newAttendee => {
      addToast({ message: "Participant ajouté à l'évènement !", variant: 'info' })

      queryClient.setQueryData(['event', { id: eventId }], (old: DetailedEventDto) => ({
        ...old,
        attendees: [newAttendee, ...attendees],
      }))
    },
    onError: () => addToast({ message: "Impossible d'ajouter ce participant", variant: 'error' }),
  })

  const { mutateAsync: deleteAttendee, isPending: deleteAttendeePending } = useMutation({
    mutationKey: ['event.deleteAttendee', { id: eventId }],
    mutationFn: (attendeeId: string) => api.attendee.deleteAttendee({ eventId, attendeeId }),
    onSuccess: (_, attendeeId) => {
      addToast({ message: "Participant supprimé de l'évènement !", variant: 'info' })

      queryClient.setQueryData(['event', { id: eventId }], (old: DetailedEventDto) => ({
        ...old,
        attendees: [...attendees].filter(a => a.id !== attendeeId),
      }))
    },
    onError: () => addToast({ message: 'Impossible de supprimer ce participant', variant: 'error' }),
  })

  const loading = useMemo(
    () => addAttendeePending || deleteAttendeePending,
    [addAttendeePending, deleteAttendeePending],
  )

  return (
    <CardV2>
      <Stack>
        <Box>
          <InputLabel>Ajouter un nouveau participant à l'évènement ?</InputLabel>

          <SearchUserSelect
            disabled={loading}
            excludedEmails={[...attendeeEmails, currentUserEmail || '']}
            onChange={value =>
              addAttendee({ email: typeof value === 'string' ? value : value.email, role: AttendeeRole.USER })
            }
          />
        </Box>

        <Divider sx={{ marginBlock: '20px' }} />

        <List>
          {attendees.map(attendee => (
            <ListItem
              key={attendee.id}
              className="animated zoomIn fast"
              disablePadding
              secondaryAction={
                <ConfirmIconButton
                  disabled={attendee?.user?.id === currentUserId}
                  confirmTitle="Enlever ce participant ?"
                  confirmText={
                    <>
                      Êtes-vous sur de retirer le participant{' '}
                      <b>
                        {attendee.pending_email
                          ? attendee.pending_email
                          : `${attendee.user?.firstname} ${attendee.user?.lastname}`}
                      </b>{' '}
                      de l'évènement ?
                    </>
                  }
                  onClick={() => deleteAttendee(attendee.id)}
                >
                  <DeleteIcon />
                </ConfirmIconButton>
              }
            >
              <ListItemButton>
                <ListItemAttendee
                  role={attendee.role as AttendeeRole}
                  userName={`${attendee.user?.firstname} ${attendee.user?.lastname}`}
                  isPending={!!attendee.pending_email}
                  email={attendee.pending_email ?? attendee.user?.email ?? ''}
                  pictureUrl={attendee.user?.picture_url}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </CardV2>
  )
}
