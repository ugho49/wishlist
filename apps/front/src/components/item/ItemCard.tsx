import React from 'react';
import { ItemDto } from '@wishlist/common-types';
import { Card } from '../common/Card';

export type ItemCardProps = {
  item: ItemDto;
};

export const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <Card>
      <span>{item.name}</span>
      <p>{item.description}</p>
    </Card>
  );
};
