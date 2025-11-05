import type { EventId, MiniEventDto } from '@wishlist/common'

import CloseIcon from '@mui/icons-material/Close'
import {
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
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { parseISO } from '@wishlist/common'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale/fr'

import { RouterLink } from '../common/RouterLink'
import { EventIcon } from '../event/EventIcon'

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
  const navigate = useNavigate()

  const handleEventClick = (eventId: EventId) => {
    void navigate({ to: '/events/$eventId', params: { eventId } })
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
                <EventIcon icon={event.icon} />
              </ListItemAvatar>
              <ListItemText
                primary={<b>{event.title}</b>}
                secondary={format(parseISO(event.event_date), 'PPP', { locale: fr })}
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
