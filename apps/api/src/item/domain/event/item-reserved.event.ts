import type { EventId, ItemId, UserId, WishlistId } from '@wishlist/common';

export class ItemReservedEvent {
  public readonly itemId: ItemId;
  public readonly itemName: string;
  public readonly wishlistId: WishlistId;
  public readonly wishlistTitle: string;
  public readonly hideItems: boolean;
  public readonly ownerId: UserId;
  public readonly coOwnerId?: UserId;
  public readonly eventIds: EventId[];
  public readonly actorId: UserId;
  public readonly actorFirstName: string;

  constructor(props: {
    itemId: ItemId;
    itemName: string;
    wishlistId: WishlistId;
    wishlistTitle: string;
    hideItems: boolean;
    ownerId: UserId;
    coOwnerId?: UserId;
    eventIds: EventId[];
    actorId: UserId;
    actorFirstName: string;
  }) {
    this.itemId = props.itemId;
    this.itemName = props.itemName;
    this.wishlistId = props.wishlistId;
    this.wishlistTitle = props.wishlistTitle;
    this.hideItems = props.hideItems;
    this.ownerId = props.ownerId;
    this.coOwnerId = props.coOwnerId;
    this.eventIds = props.eventIds;
    this.actorId = props.actorId;
    this.actorFirstName = props.actorFirstName;
  }
}
