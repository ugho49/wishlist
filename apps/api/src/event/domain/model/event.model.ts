import type { EventId, ICurrentUser, UserId, WishlistId } from '@wishlist/common';
import type { Wishlist } from '../../../wishlist/domain/wishlist.model';
import type { EventAttendee } from './event-attendee.model';

import { AttendeeRole } from '../attendee-role.enum';

export type EventProps = {
  id: EventId;
  title: string;
  description?: string;
  icon?: string;
  eventDate: Date;
  attendees: EventAttendee[];
  wishlistIds: WishlistId[];
  createdAt: Date;
  updatedAt: Date;
};

export class Event {
  public readonly id: EventId;
  public readonly title: string;
  public readonly description?: string;
  public readonly icon?: string;
  public readonly eventDate: Date;
  public readonly attendees: EventAttendee[];
  public readonly wishlistIds: WishlistId[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: EventProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.icon = props.icon;
    this.eventDate = props.eventDate;
    this.attendees = orderedAttendees(props.attendees);
    this.wishlistIds = props.wishlistIds;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(param: {
    id: EventId;
    title: string;
    description?: string;
    icon?: string;
    eventDate: Date;
    attendees: EventAttendee[];
  }): Event {
    if (param.attendees.length === 0) {
      throw new Error('Event must have at least one attendee');
    }

    const now = new Date();

    return new Event({
      id: param.id,
      title: param.title,
      description: param.description,
      icon: param.icon,
      eventDate: param.eventDate,
      attendees: param.attendees,
      wishlistIds: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  update(updates: { title: string; description?: string; icon?: string; eventDate: Date }): Event {
    return new Event({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  isFinished(): boolean {
    return this.eventDate < new Date();
  }

  canEdit(currentUser: ICurrentUser): boolean {
    return this.canAccessByRole({
      currentUser,
      acceptedRoles: [AttendeeRole.CREATOR, AttendeeRole.ADMIN],
    });
  }

  canView(currentUser: ICurrentUser): boolean {
    return this.canAccessByRole({
      currentUser,
      acceptedRoles: [AttendeeRole.CREATOR, AttendeeRole.ADMIN, AttendeeRole.PARTICIPANT],
    });
  }

  canAddWishlist(currentUserId: UserId): boolean {
    return this.attendees.some(a => a.user?.id === currentUserId);
  }

  /**
   * The attendees who have not filled a wishlist for this event yet: they manage (own or co-own) none of the
   * `filledWishlists` linked to the event. Pending invitees (no account yet) never have one.
   *
   * @param filledWishlists lists with at least one wish added by their managers (suggestions do not count)
   */
  attendeesWithoutWishlist(filledWishlists: Wishlist[]): EventAttendee[] {
    const eventWishlists = filledWishlists.filter(wishlist => wishlist.isLinkedToEvent(this.id));

    return this.attendees.filter(attendee => {
      const userId = attendee.user?.id;
      if (!userId) return true;
      return !eventWishlists.some(wishlist => wishlist.isOwnerOrCoOwner(userId));
    });
  }

  private canAccessByRole(params: { currentUser: ICurrentUser; acceptedRoles: AttendeeRole[] }): boolean {
    const { currentUser, acceptedRoles } = params;
    if (currentUser.isAdmin) return true;
    const attendee = this.attendees.find(a => a.user?.id === currentUser.id);
    if (!attendee) return false;
    return acceptedRoles.includes(attendee.role);
  }
}

function orderedAttendees(attendees: EventAttendee[]): EventAttendee[] {
  return [...attendees].sort((left, right) => {
    if (left.isCreator() !== right.isCreator()) {
      return left.isCreator() ? -1 : 1;
    }
    return left.id.localeCompare(right.id);
  });
}
