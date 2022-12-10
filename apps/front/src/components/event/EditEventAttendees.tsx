import React from 'react';
import { AttendeeDto } from '@wishlist/common-types';

export type EditEventAttendeesProps = {
  eventId: string;
  attendees: AttendeeDto[];
  onChange: (attendees: AttendeeDto[]) => void;
};

export const EditEventAttendees = ({ eventId, attendees, onChange }: EditEventAttendeesProps) => {
  return <div>EditEventAttendees</div>;
};
