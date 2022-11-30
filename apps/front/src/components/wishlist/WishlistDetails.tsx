import React from 'react';
import { DetailedWishlistDto } from '@wishlist/common-types';

export type WishlistDetailsProps = {
  wishlist: DetailedWishlistDto;
};

export const WishlistDetails = ({ wishlist }: WishlistDetailsProps) => {
  return <div>WishlistDetails</div>;
};
