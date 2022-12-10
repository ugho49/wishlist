import React from 'react';
import { AttendeeDto, MiniUserDto } from '@wishlist/common-types';
import {
  Avatar,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { blue, orange, green } from '@mui/material/colors';
import PersonIcon from '@mui/icons-material/Person';

export interface EventAttendeesDialogDialog {
  open: boolean;
  handleClose: () => void;
  creator: MiniUserDto;
  attendees: AttendeeDto[];
}

export const EventAttendeesDialog = ({ open, attendees, creator, handleClose }: EventAttendeesDialogDialog) => {
  return (
    <Dialog onClose={() => handleClose()} open={open}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <span>Participants</span>
          <IconButton onClick={() => handleClose()}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: green[100], color: green[600] }}>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<b>{`${creator.firstname} ${creator.lastname}`}</b>} secondary={creator.email} />
        </ListItem>
        {attendees.map((attendee) => (
          <ListItem key={attendee.id}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: attendee.pending_email ? orange[100] : blue[100],
                  color: attendee.pending_email ? orange[600] : blue[600],
                }}
              >
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <b>
                  {attendee.pending_email ? 'Invitation' : `${attendee.user?.firstname} ${attendee.user?.lastname}`}
                </b>
              }
              secondary={attendee.pending_email ? attendee.pending_email : attendee.user?.email}
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};
