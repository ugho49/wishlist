import type { MiniEventDto } from '@wishlist/common-types'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CloseIcon from '@mui/icons-material/Close'
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  useTheme,
} from '@mui/material'
import { DateTime } from 'luxon'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { RouterLink } from '../common/RouterLink'

export interface EventDialogProps {
  open: boolean
  handleClose: () => void
  events: MiniEventDto[]
  wishlistId: string
  currentUserCanEdit: boolean
}

export const WishlistEventsDialog = ({
  open,
  events,
  handleClose,
  wishlistId,
  currentUserCanEdit,
}: EventDialogProps) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  return (
    <Dialog onClose={() => handleClose()} open={open}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <span>Sélectionner un évènement</span>
          <IconButton onClick={() => handleClose()}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List>
          {events.map(event => (
            <ListItemButton onClick={() => handleEventClick(event.id)} key={event.id}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.background.paper }}>
                  <CalendarMonthIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<b>{event.title}</b>}
                secondary={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      {currentUserCanEdit && (
        <DialogActions>
          <Button variant="text" component={RouterLink} to={`/wishlists/${wishlistId}/edit?tab=events`}>
            Gérer les évènements
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
