import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Stack,
} from '@mui/material'
import { AttendeeDto, AttendeeRole } from '@wishlist/common-types'
import React from 'react'

import { RouterLink } from '../common/RouterLink'
import { ListItemAttendee } from './ListItemAttendee'

export interface EventAttendeesDialogProps {
  open: boolean
  handleClose: () => void
  eventId: string
  currentUserCanEdit: boolean
  attendees: AttendeeDto[]
}

export const EventAttendeesDialog = ({
  open,
  attendees,
  handleClose,
  eventId,
  currentUserCanEdit,
}: EventAttendeesDialogProps) => {
  return (
    <Dialog onClose={() => handleClose()} open={open} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <span>Participants</span>
          <IconButton onClick={() => handleClose()}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 0 }}>
        <List>
          {attendees.map(attendee => (
            <ListItem key={attendee.id}>
              <ListItemAttendee
                role={attendee.role as AttendeeRole}
                userName={`${attendee.user?.firstname} ${attendee.user?.lastname}`}
                isPending={!!attendee.pending_email}
                email={attendee.pending_email ?? attendee.user?.email ?? ''}
                pictureUrl={attendee.user?.picture_url}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      {currentUserCanEdit && (
        <DialogActions>
          <Button variant="text" component={RouterLink} to={`/events/${eventId}/edit?tab=attendees`}>
            Gérer les participants
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
