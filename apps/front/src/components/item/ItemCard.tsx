import React from 'react';
import { ItemDto } from '@wishlist/common-types';

export type ItemCardProps = {
  item: ItemDto;
};

export const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <div>
      <span>{item.name}</span>
      <p>{item.description}</p>
    </div>
  );
};
