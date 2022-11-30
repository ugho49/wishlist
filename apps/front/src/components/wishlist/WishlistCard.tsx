import React from 'react';
import { MiniEventDto, WishlistWithEventsDto, WishlistWithOwnerDto } from '@wishlist/common-types';
import { makeStyles } from '@mui/styles';
import { Card } from '../Card';
import {
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Theme,
  Tooltip,
  useTheme,
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';

export type WishlistCardProps = {
  wishlist: WishlistWithEventsDto | WishlistWithOwnerDto;
};

const useStyles = makeStyles((theme: Theme) => ({
  wishlist: {
    color: theme.palette.text.secondary,
    flexGrow: 1,
    width: '95%',
    paddingRight: '10px',
    letterSpacing: '0.05em',
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: 400,
    marginBottom: '10px',
    textAlign: 'center',
    overflow: 'hidden',
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  arrow: {
    display: 'flex',
    color: theme.palette.primary.light,
    alignItems: 'center',
    flexBasis: '5%',
  },
}));

interface EventDialogProps {
  open: boolean;
  handleClose: () => void;
  events: MiniEventDto[];
}

function EventsDialog({ open, events, handleClose }: EventDialogProps) {
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
}

export const WishlistCard = ({ wishlist }: WishlistCardProps) => {
  const classes = useStyles();
  const [openEventDialog, setOpenEventDialog] = React.useState(false);

  // TODO: Add opacity and checkmark if all events are pasts

  return (
    <>
      <Card to={`/wishlists/${wishlist.id}`} className="animated fadeIn fast">
        <Stack direction="row" justifyContent="space-between">
          <div className={classes.wishlist}>
            <div className={classes.title}>{wishlist.title}</div>
            <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="wrap" gap={1}>
              {!wishlist.config.hide_items && (
                <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                  <Chip label="Publique" color="info" size="small" icon={<PublicIcon />} />
                </Tooltip>
              )}
              {'events' in wishlist && (
                <Chip
                  color="default"
                  size="small"
                  icon={<CalendarMonthIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenEventDialog(true);
                  }}
                  label={`${wishlist.events.length} ${wishlist.events.length > 1 ? 'évènements' : 'évènement'}`}
                />
              )}
              {'owner' in wishlist && (
                <>
                  {/* TODO --> */}
                  {/*<div className="owner">{`${wishlist.owner.firstname} ${wishlist.owner.lastname}`}</div>*/}
                </>
              )}
            </Stack>
          </div>
          <div className={classes.arrow}>
            <KeyboardArrowRightIcon />
          </div>
        </Stack>
      </Card>
      {'events' in wishlist && (
        <EventsDialog open={openEventDialog} handleClose={() => setOpenEventDialog(false)} events={wishlist.events} />
      )}
    </>
  );
};
