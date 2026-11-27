import type { User } from '../../../user/domain/model/user.model';

import { type AttendeeId, type EventId } from '@wishlist/common';

import { AttendeeRole } from '../attendee-role.enum';

/** Minimum delay between two wishlist reminders sent to the same attendee. */
export const WISHLIST_REMINDER_COOLDOWN_IN_HOURS = 72;

const WISHLIST_REMINDER_COOLDOWN_IN_MS = WISHLIST_REMINDER_COOLDOWN_IN_HOURS * 60 * 60 * 1000;

export type EventAttendeeProps = {
  id: AttendeeId;
  eventId: EventId;
  user?: User;
  pendingEmail?: string;
  role: AttendeeRole;
  /** When an admin of the event last reminded the attendee to fill their wishlist. */
  lastRemindedAt?: Date;
};

export class EventAttendee {
  public readonly id: AttendeeId;
  public readonly eventId: EventId;
  public readonly user?: User;
  public readonly pendingEmail?: string;
  public readonly role: AttendeeRole;
  public readonly lastRemindedAt?: Date;

  constructor(props: EventAttendeeProps) {
    if (props.user && props.pendingEmail) {
      throw new Error('Params "user" and "pendingEmail" cannot be provided together');
    }

    this.id = props.id;
    this.eventId = props.eventId;
    this.user = props.user;
    this.pendingEmail = props.pendingEmail;
    this.role = props.role;
    this.lastRemindedAt = props.lastRemindedAt;
  }

  static createFromExistingUser(param: {
    id: AttendeeId;
    eventId: EventId;
    user: User;
    role: AttendeeRole;
  }): EventAttendee {
    return new EventAttendee({
      id: param.id,
      eventId: param.eventId,
      user: param.user,
      pendingEmail: undefined,
      role: param.role,
    });
  }

  static createFromNonExistingUser(param: {
    id: AttendeeId;
    eventId: EventId;
    pendingEmail: string;
    role: AttendeeRole;
  }): EventAttendee {
    return new EventAttendee({
      id: param.id,
      eventId: param.eventId,
      user: undefined,
      pendingEmail: param.pendingEmail,
      role: param.role,
    });
  }

  getEmail(): string {
    return this.user?.email ?? this.pendingEmail ?? '';
  }

  getFullNameOrPendingEmail(): string {
    return this.user?.firstName && this.user?.lastName
      ? `${this.user.firstName} ${this.user.lastName}`
      : (this.pendingEmail ?? '');
  }

  isLinkedToUser(): boolean {
    return this.user !== undefined;
  }

  isTemporaryAttendee(): boolean {
    return this.pendingEmail !== undefined;
  }

  convertTemporaryAttendeeToUser(user: User) {
    if (!this.isTemporaryAttendee()) {
      throw new Error('Attendee is not a temporary attendee');
    }

    return new EventAttendee({
      ...this,
      user,
      pendingEmail: undefined,
    });
  }

  isCreator(): boolean {
    return this.role === AttendeeRole.CREATOR;
  }

  updateRole(role: AttendeeRole): EventAttendee {
    return new EventAttendee({
      ...this,
      role,
    });
  }

  /** False while the last wishlist reminder is under the cooldown: the attendee is not reminded twice in a row. */
  canBeRemindedAt(now: Date): boolean {
    if (!this.lastRemindedAt) return true;
    return now.getTime() - this.lastRemindedAt.getTime() >= WISHLIST_REMINDER_COOLDOWN_IN_MS;
  }

  remind(now: Date): EventAttendee {
    if (!this.canBeRemindedAt(now)) {
      throw new Error('Attendee was reminded too recently');
    }

    return new EventAttendee({
      ...this,
      lastRemindedAt: now,
    });
  }
}
