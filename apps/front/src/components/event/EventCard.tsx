import React from 'react';
import { EventWithCountsDto } from '@wishlist/common-types';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { DateTime } from 'luxon';
import { makeStyles } from '@mui/styles';
import { Card } from '../Card';
import { Stack, Theme } from '@mui/material';
import clsx from 'clsx';

export type EventCardProps = {
  event: EventWithCountsDto;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
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
  past: {
    display: 'flex',
    position: 'absolute',
    right: '-5px',
    top: '-5px',
    color: theme.palette.success.light,
  },
  disabled: {
    backgroundColor: '#f7f7f7',
    '& > *': {
      opacity: '.6',
    },
  },
}));

export const EventCard = ({ event }: EventCardProps) => {
  const classes = useStyles();
  const numberOfAttendees = event.nb_attendees + 1;
  const past = new Date(event.event_date) < new Date();

  return (
    <Card to={`/events/${event.id}`} className={clsx(classes.root, past && classes.disabled, 'animated fadeIn fast')}>
      <Stack direction="row" justifyContent="space-between">
        <div className={classes.event}>
          <div className={classes.title}>{event.title}</div>
          <div className={classes.infos}>
            <div>
              {numberOfAttendees} {numberOfAttendees > 1 ? 'participants' : 'participant'}
            </div>
            <div>
              {event.nb_wishlists} {event.nb_wishlists > 1 ? 'listes' : 'liste'}
            </div>
            <div>{DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}</div>
          </div>
        </div>
        <div className={classes.arrow}>
          <KeyboardArrowRightIcon />
        </div>
      </Stack>
      {past && (
        <div className={classes.past}>
          <TaskAltIcon />
        </div>
      )}
    </Card>
  );
};
