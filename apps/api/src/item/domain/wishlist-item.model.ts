import type { ItemId, UserId, WishlistId } from '@wishlist/common';
import type { User } from '../../user/domain/model/user.model';

export type ItemTaker = {
  userId: UserId;
  takenAt: Date;
};

export type WishlistItemProps = {
  id: ItemId;
  importSourceId?: ItemId;
  wishlistId: WishlistId;
  name: string;
  description?: string;
  url?: string;
  score?: number;
  isSuggested: boolean;
  imageUrl?: string;
  takers: ItemTaker[];
  createdAt: Date;
  updatedAt: Date;
};

export class WishlistItem {
  public readonly id: ItemId;
  public readonly importSourceId?: ItemId;
  public readonly wishlistId: WishlistId;
  public readonly name: string;
  public readonly description?: string;
  public readonly url?: string;
  public readonly score?: number;
  public readonly isSuggested: boolean;
  public readonly imageUrl?: string;
  public readonly takers: ItemTaker[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WishlistItemProps) {
    this.id = props.id;
    this.importSourceId = props.importSourceId;
    this.wishlistId = props.wishlistId;
    this.name = props.name;
    this.description = props.description;
    this.url = props.url;
    this.score = props.score;
    this.isSuggested = props.isSuggested;
    this.imageUrl = props.imageUrl;
    this.takers = props.takers;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(params: {
    id: ItemId;
    name: string;
    description?: string;
    url?: string;
    score?: number;
    isSuggested: boolean;
    imageUrl?: string;
    wishlistId: WishlistId;
    importSourceId?: ItemId;
    takers?: ItemTaker[];
  }): WishlistItem {
    const now = new Date();

    return new WishlistItem({
      id: params.id,
      wishlistId: params.wishlistId,
      name: params.name,
      description: params.description,
      url: params.url,
      score: params.score,
      isSuggested: params.isSuggested,
      imageUrl: params.imageUrl,
      importSourceId: params.importSourceId,
      takers: params.takers ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  convertToSuggested(): WishlistItem {
    return new WishlistItem({
      ...this,
      isSuggested: true,
    });
  }

  exportTo(params: { id: ItemId; wishlistId: WishlistId }): WishlistItem {
    if (this.isSuggested) {
      throw new Error('You cannot export a suggested item');
    }

    const now = new Date();

    return new WishlistItem({
      id: params.id,
      wishlistId: params.wishlistId,
      name: this.name,
      description: this.description,
      url: this.url,
      score: this.score,
      isSuggested: false,
      imageUrl: this.imageUrl,
      importSourceId: this.id,
      takers: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  update(params: {
    name?: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    score?: number;
  }): WishlistItem {
    return new WishlistItem({ ...this, ...params, updatedAt: new Date() });
  }

  isTakenBySomeone() {
    return this.takers.length > 0;
  }

  isTakenBy(userId: UserId) {
    return this.takers.some(taker => taker.userId === userId);
  }

  check(user: User): WishlistItem {
    if (this.isTakenBy(user.id)) {
      return this;
    }

    return new WishlistItem({
      ...this,
      takers: [...this.takers, { userId: user.id, takenAt: new Date() }],
      updatedAt: new Date(),
    });
  }

  uncheck(userId: UserId): WishlistItem {
    if (!this.isTakenBy(userId)) {
      return this;
    }

    return new WishlistItem({
      ...this,
      takers: this.takers.filter(taker => taker.userId !== userId),
      updatedAt: new Date(),
    });
  }

  public static canDisplaySensitiveInformations(params: {
    wishlist: { hideItems: boolean; isOwner: boolean; isCoOwner: boolean };
  }): boolean {
    const { wishlist } = params;

    // If hideItems is false, we want to display all items, including suggested and with the taker
    if (!wishlist.hideItems) return true;

    // If we are the owner or co-owner of the list, we not want the information to be displayed
    return !wishlist.isOwner && !wishlist.isCoOwner;
  }

  public static canShowItem(params: {
    item: WishlistItem;
    wishlist: { hideItems: boolean; isOwner: boolean; isCoOwner: boolean };
  }): boolean {
    const { item, wishlist } = params;

    // If hideItems is false, we force items to be shown, even if they are suggested
    if (!wishlist.hideItems) return true;

    // If we are not the owner or co-owner of the list, display all items
    if (!wishlist.isOwner && !wishlist.isCoOwner) return true;

    // In this case, current user is owner or co-owner of the list
    // we want to show him only the item that are not suggested
    return !item.isSuggested;
  }
}
