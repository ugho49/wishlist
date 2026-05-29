import type { AttendeeId, EventId } from '@wishlist/common'
import type { RootState } from '../../core'
import type { EventAttendee } from './event.types'

import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Divider, List, ListItem, ListItemButton } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { AttendeeRole, useAddEventAttendeeMutation, useRemoveEventAttendeeMutation } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks'
import { Card } from '../common/Card'
import { ConfirmIconButton } from '../common/ConfirmIconButton'
import { Subtitle } from '../common/Subtitle'
import { SearchUserSelect } from '../user/SearchUserSelect'
import { ListItemAttendee } from './ListItemAttendee'

export type EditEventAttendeesProps = {
  eventId: EventId
  attendees: EventAttendee[]
}

const mapState = (state: RootState) => ({ email: state.auth.user?.email, id: state.auth.user?.id })

export const EditEventAttendees = ({ eventId, attendees }: EditEventAttendeesProps) => {
  const { id: currentUserId, email: currentUserEmail } = useSelector(mapState)
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const attendeeEmails = useMemo(
    () => attendees.map(attendee => (attendee.pendingEmail ? attendee.pendingEmail : attendee.user?.email || '')),
    [attendees],
  )

  const invalidateEvent = () => queryClient.invalidateQueries({ queryKey: ['EventPageGetEvent', { eventId }] })

  const { mutateAsync: addAttendeeMutation, isPending: addAttendeePending } = useAddEventAttendeeMutation()
  const { mutateAsync: removeAttendeeMutation, isPending: deleteAttendeePending } = useRemoveEventAttendeeMutation()

  const addAttendee = async (email: string) => {
    try {
      const res = await addAttendeeMutation({ eventId, input: { email, role: AttendeeRole.User } })
      unwrapResult(res.addEventAttendee, 'EventAttendee')
      addToast({ message: "Participant ajouté à l'évènement !", variant: 'info' })
      await invalidateEvent()
    } catch {
      addToast({ message: "Impossible d'ajouter ce participant", variant: 'error' })
    }
  }

  const deleteAttendee = async (attendeeId: AttendeeId) => {
    try {
      const res = await removeAttendeeMutation({ eventId, attendeeId })
      unwrapResult(res.removeEventAttendee, 'VoidOutput')
      addToast({ message: "Participant supprimé de l'évènement !", variant: 'info' })
      await invalidateEvent()
    } catch {
      addToast({ message: 'Impossible de supprimer ce participant', variant: 'error' })
    }
  }

  const loading = useMemo(
    () => addAttendeePending || deleteAttendeePending,
    [addAttendeePending, deleteAttendeePending],
  )

  return (
    <Card>
      <Subtitle>Gérer les participants</Subtitle>

      <Box>
        <SearchUserSelect
          label="Ajouter un nouveau participant à l'évènement ?"
          disabled={loading}
          excludedEmails={[...attendeeEmails, currentUserEmail || '']}
          onChange={value => addAttendee(typeof value === 'string' ? value : value.email)}
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
                      {attendee.pendingEmail
                        ? attendee.pendingEmail
                        : `${attendee.user?.firstName} ${attendee.user?.lastName}`}
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
                role={attendee.role}
                userName={`${attendee.user?.firstName} ${attendee.user?.lastName}`}
                isPending={!!attendee.pendingEmail}
                email={attendee.pendingEmail ?? attendee.user?.email ?? ''}
                pictureUrl={attendee.user?.pictureUrl ?? undefined}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  )
}
