import type { EventAttendee } from './event.types';

import CloseIcon from '@mui/icons-material/Close';
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
} from '@mui/material';

import { RouterLink } from '../common/RouterLink';
import { ListItemAttendee } from './ListItemAttendee';

export interface EventAttendeesDialogProps {
  open: boolean;
  handleClose: () => void;
  eventId: string;
  currentUserCanEdit: boolean;
  attendees: EventAttendee[];
  /** Left out when the attendees cannot be reminded (finished event). */
  openRemindAttendeesDialog?: () => void;
}

export const EventAttendeesDialog = ({
  open,
  attendees,
  handleClose,
  eventId,
  currentUserCanEdit,
  openRemindAttendeesDialog,
}: EventAttendeesDialogProps) => (
  <Dialog onClose={() => handleClose()} open={open} fullWidth maxWidth="xs">
    <DialogTitle>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
              role={attendee.role}
              userName={`${attendee.user?.firstName} ${attendee.user?.lastName}`}
              isPending={!!attendee.pendingEmail}
              email={attendee.pendingEmail ?? attendee.user?.email ?? ''}
              pictureUrl={attendee.user?.pictureUrl ?? undefined}
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    {currentUserCanEdit && (
      <DialogActions>
        {openRemindAttendeesDialog ? (
          <Button variant="text" onClick={openRemindAttendeesDialog}>
            Relancer
          </Button>
        ) : null}
        <Button variant="text" component={RouterLink} to={`/events/${eventId}/edit?tab=attendees`}>
          Gérer les participants
        </Button>
      </DialogActions>
    )}
  </Dialog>
);
