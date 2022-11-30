import React from 'react';
import { MiniEventDto } from '@wishlist/common-types';
import {
  Avatar,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateTime } from 'luxon';

export interface EventDialogProps {
  open: boolean;
  handleClose: () => void;
  events: MiniEventDto[];
}

export const WishlistEventsDialog = ({ open, events, handleClose }: EventDialogProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

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
      <List sx={{ pt: 0 }}>
        {events.map((event) => (
          <ListItemButton onClick={() => handleEventClick(event.id)} key={event.id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.background.paper }}>
                <CalendarMonthIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={event.title}
              secondary={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
            />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
};
