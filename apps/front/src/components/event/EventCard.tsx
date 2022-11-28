import React from 'react';
import { EventWithCountsDto } from '@wishlist/common-types';
import { Card, CardActionArea } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { makeStyles } from '@mui/styles';

export type EventCardProps = {
  event: EventWithCountsDto;
};

const useStyles = makeStyles((theme) => ({
  root: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
}));

export const EventCard = ({ event }: EventCardProps) => {
  const classes = useStyles();
  const numberOfAttendees = event.nb_attendees + 1;
  const past = new Date(event.event_date) < new Date();

  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea component={Link} to={`/events/${event.id}`}>
        <div className={classes.root}>
          <div className="event">
            <div className="title">{event.title}</div>
            <div className="infos">
              <div>
                {numberOfAttendees} {numberOfAttendees > 1 ? 'participants' : 'participant'}
              </div>
              <div className="only-large-screen">
                {event.nb_wishlists} {event.nb_wishlists > 1 ? 'listes' : 'liste'}
              </div>
              <div>{DateTime.fromISO(event.event_date).toLocaleString()}</div>
            </div>
          </div>
          <div className="arrow">
            <ArrowForwardIosIcon />
          </div>
        </div>
      </CardActionArea>
    </Card>
  );
};
