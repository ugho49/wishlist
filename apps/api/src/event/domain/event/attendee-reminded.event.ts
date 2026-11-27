import type { User } from '../../../user/domain/model/user.model';
import type { Event } from '../model/event.model';
import type { EventAttendee } from '../model/event-attendee.model';

/** An admin of the event reminded an attendee to fill their wishlist. */
export class AttendeeRemindedEvent {
  public readonly event: Event;
  public readonly attendee: EventAttendee;
  public readonly remindedBy: User;

  constructor(props: { event: Event; attendee: EventAttendee; remindedBy: User }) {
    this.event = props.event;
    this.attendee = props.attendee;
    this.remindedBy = props.remindedBy;
  }
}
