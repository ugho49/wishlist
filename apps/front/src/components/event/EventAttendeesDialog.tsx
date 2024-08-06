import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogTitle, IconButton, List, ListItem, Stack } from '@mui/material'
import { AttendeeDto, AttendeeRole } from '@wishlist/common-types'
import React from 'react'

import { ListItemAttendee } from './ListItemAttendee'

export interface EventAttendeesDialogDialog {
  open: boolean
  handleClose: () => void
  attendees: AttendeeDto[]
}

export const EventAttendeesDialog = ({ open, attendees, handleClose }: EventAttendeesDialogDialog) => {
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
      <List sx={{ pt: 0 }}>
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
    </Dialog>
  )
}
