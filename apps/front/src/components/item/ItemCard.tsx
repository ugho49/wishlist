import React, { useState } from 'react';
import { ItemDto } from '@wishlist/common-types';
import { Card } from '../common/Card';
import { ItemFormDialog } from './ItemFormDialog';

export type ItemCardProps = {
  wishlistId: string;
  item: ItemDto;
  handleUpdate: (newValue: ItemDto) => void;
  handleDelete: () => void;
};

export const ItemCard = ({ item, handleDelete, handleUpdate, wishlistId }: ItemCardProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Card onClick={() => setOpenDialog(true)}>
        <div>{item.name}</div>
        <div>{item.description}</div>
        <div>{item.url}</div>
        <div>Score: {item.score}</div>
      </Card>
      <ItemFormDialog
        mode="edit"
        item={item}
        wishlistId={wishlistId}
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleUpdate={(updatedItem) => handleUpdate(updatedItem)}
        handleDelete={() => handleDelete()}
      />
    </>
  );
};
