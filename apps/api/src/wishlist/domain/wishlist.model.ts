import type { EventId, ICurrentUser, UserId, WishlistId } from '@wishlist/common';
import type { User } from '../../user/domain/model/user.model';

import { WishlistMode } from './wishlist-mode.enum';

export type WishlistProps = {
  id: WishlistId;
  title: string;
  description?: string;
  ownerId: UserId;
  coOwnerId?: UserId;
  mode: WishlistMode;
  logoUrl?: string;
  eventIds: EventId[];
  createdAt: Date;
  updatedAt: Date;
};

export class Wishlist {
  public readonly id: WishlistId;
  public readonly title: string;
  public readonly description?: string;
  public readonly ownerId: UserId;
  public readonly coOwnerId?: UserId;
  public readonly mode: WishlistMode;
  public readonly logoUrl?: string;
  public readonly eventIds: EventId[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WishlistProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.ownerId = props.ownerId;
    this.coOwnerId = props.coOwnerId;
    this.mode = props.mode;
    this.logoUrl = props.logoUrl;
    this.eventIds = props.eventIds;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(params: {
    id: WishlistId;
    title: string;
    eventIds: EventId[];
    description?: string;
    ownerId: UserId;
    mode: WishlistMode;
    logoUrl?: string;
  }): Wishlist {
    const now = new Date();

    return new Wishlist({
      id: params.id,
      title: params.title,
      description: params.description,
      ownerId: params.ownerId,
      mode: params.mode,
      logoUrl: params.logoUrl,
      eventIds: params.eventIds,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(params: { title: string; description?: string }) {
    return new Wishlist({
      ...this,
      title: params.title,
      description: params.description,
      updatedAt: new Date(),
    });
  }

  updateLogoUrl(logoUrl?: string) {
    return new Wishlist({
      ...this,
      logoUrl,
      updatedAt: new Date(),
    });
  }

  isLinkedToEvent(id: EventId): boolean {
    return this.eventIds.includes(id);
  }

  linkEvent(eventId: EventId) {
    return new Wishlist({
      ...this,
      eventIds: [...this.eventIds, eventId],
      updatedAt: new Date(),
    });
  }

  unlinkEvent(eventId: EventId) {
    return new Wishlist({
      ...this,
      eventIds: this.eventIds.filter(id => id !== eventId),
      updatedAt: new Date(),
    });
  }

  isOwner(userId: UserId) {
    return this.ownerId === userId;
  }

  isCoOwner(userId: UserId) {
    return this.coOwnerId === userId;
  }

  isOwnerOrCoOwner(userId: UserId) {
    return this.isOwner(userId) || this.isCoOwner(userId);
  }

  /** The managers (owner and co-owner) and the admins can edit or delete the list. */
  canBeModifiedBy(currentUser: ICurrentUser): boolean {
    return this.isOwnerOrCoOwner(currentUser.id) || currentUser.isAdmin;
  }

  /** Only the owner (or an admin) can remove the co-owner. */
  canRemoveCoOwner(currentUser: ICurrentUser): boolean {
    return this.isOwner(currentUser.id) || currentUser.isAdmin;
  }

  /**
   * Whether the reservations and the items suggested by the others are hidden from this user:
   * true for the managers of a list in surprise mode.
   */
  isSurpriseFor(userId: UserId): boolean {
    return this.mode === WishlistMode.SURPRISE && this.isOwnerOrCoOwner(userId);
  }

  canHaveCoOwner(): boolean {
    return this.mode === WishlistMode.SHARED;
  }

  addCoOwner(coOwner: User) {
    return new Wishlist({
      ...this,
      coOwnerId: coOwner.id,
      updatedAt: new Date(),
    });
  }

  removeCoOwner() {
    return new Wishlist({
      ...this,
      coOwnerId: undefined,
      updatedAt: new Date(),
    });
  }
}
