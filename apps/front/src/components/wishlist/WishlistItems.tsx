import React from 'react';
import { DetailedWishlistDto } from '@wishlist/common-types';
import { ItemCard } from '../item/ItemCard';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AutoExtendedFab } from '../AutoExtendedFab';

export type WishlistItemsProps = {
  wishlist: DetailedWishlistDto;
};

export const WishlistItems = ({ wishlist }: WishlistItemsProps) => {
  return (
    <Box className="items">
      {wishlist.items.map((item) => (
        <ItemCard item={item} key={item.id} />
      ))}

      {wishlist.items.length === 0 && (
        <Box>
          {/*TODO -->*/}
          <div>Aucun souhaits</div>
          <Button>Ajouter un souhait</Button>
        </Box>
      )}

      {wishlist.items.length > 0 && <AutoExtendedFab label="Ajouter un souhait" icon={<AddIcon />} color="secondary" />}
    </Box>
  );
};
