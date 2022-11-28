import React from 'react';
import { EventWithCountsDto } from '@wishlist/common-types';
import { Card } from '@mui/material';

export type EventCardProps = {
  event: EventWithCountsDto;
};

export const EventCard = ({ event }: EventCardProps) => {
  return <Card>{event.title}</Card>;
};
