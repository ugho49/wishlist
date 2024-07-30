import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack } from '@mui/material'
import { blue, green, orange } from '@mui/material/colors'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AddEventAttendeeInputDto,
  AttendeeDto,
  AttendeeRole,
  DetailedEventDto,
  MiniUserDto,
} from '@wishlist/common-types'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../core'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { ConfirmIconButton } from '../common/ConfirmIconButton'
import { InputLabel } from '../common/InputLabel'
import { SearchUserSelect } from '../user/SearchUserSelect'

export type EditEventAttendeesProps = {
  eventId: string
  creator: MiniUserDto
  attendees: AttendeeDto[]
}

const mapState = (state: RootState) => state.auth.user?.email

export const EditEventAttendees = ({ eventId, creator, attendees }: EditEventAttendeesProps) => {
  const currentUserEmail = useSelector(mapState)
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
      api.attendee.addAttendee({
        event_id: eventId,
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
    mutationFn: (attendeeId: string) => api.attendee.deleteAttendee(attendeeId),
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

      <List sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Card variant="outlined" sx={{ padding: 0 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: green[100], color: green[600] }} src={creator.picture_url}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<b>{`${creator.firstname} ${creator.lastname}`}</b>} secondary={creator.email} />
          </ListItem>
        </Card>
        {attendees.map(attendee => (
          <Card variant="outlined" sx={{ padding: 0 }} key={attendee.id}>
            <ListItem
              secondaryAction={
                <ConfirmIconButton
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
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: attendee.pending_email ? orange[100] : blue[100],
                    color: attendee.pending_email ? orange[600] : blue[600],
                  }}
                  src={attendee.user?.picture_url}
                >
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <b>
                    {attendee.pending_email
                      ? 'Inviter le participant'
                      : `${attendee.user?.firstname} ${attendee.user?.lastname}`}
                  </b>
                }
                secondary={attendee.pending_email ? attendee.pending_email : attendee.user?.email}
              />
            </ListItem>
          </Card>
        ))}
      </List>
    </Stack>
  )
}
