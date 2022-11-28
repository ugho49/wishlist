import React from 'react';
import { EventWithCountsDto } from '@wishlist/common-types';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DateTime } from 'luxon';
import { makeStyles } from '@mui/styles';
import { Card } from '../Card';
import { Stack, Theme } from '@mui/material';

export type EventCardProps = {
  event: EventWithCountsDto;
};

const useStyles = makeStyles((theme: Theme) => ({
  event: {
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
  infos: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: 300,
  },
  arrow: {
    display: 'flex',
    color: theme.palette.primary.light,
    alignItems: 'center',
    flexBasis: '5%',
  },
}));

export const EventCard = ({ event }: EventCardProps) => {
  const classes = useStyles();
  const numberOfAttendees = event.nb_attendees + 1;
  const past = new Date(event.event_date) < new Date();

  return (
    <Card to={`/events/${event.id}`}>
      <Stack direction="row" justifyContent="space-between">
        <div className={classes.event}>
          <div className={classes.title}>{event.title}</div>
          <div className={classes.infos}>
            <div>
              {numberOfAttendees} {numberOfAttendees > 1 ? 'participants' : 'participant'}
            </div>
            <div className="only-large-screen">
              {event.nb_wishlists} {event.nb_wishlists > 1 ? 'listes' : 'liste'}
            </div>
            <div>{DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}</div>
          </div>
        </div>
        <div className={classes.arrow}>
          <KeyboardArrowRightIcon />
        </div>
      </Stack>
    </Card>
  );
};
