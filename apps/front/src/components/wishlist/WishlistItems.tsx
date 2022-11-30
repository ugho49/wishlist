import React, { useState } from 'react';
import { DetailedWishlistDto } from '@wishlist/common-types';
import { ItemCard } from '../item/ItemCard';
import { Box, Button, Grid, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AutoExtendedFab } from '../common/AutoExtendedFab';
import { ItemFormDialog } from '../item/ItemFormDialog';

export type WishlistTabItemsProps = {
  wishlist: DetailedWishlistDto;
};

export const WishlistItems = ({ wishlist }: WishlistTabItemsProps) => {
  const [openItemFormDialog, setOpenItemFormDialog] = useState(false);
  const nbOfItems = wishlist.items.length;

  const addItem = () => {
    setOpenItemFormDialog(true);
  };

  return (
    <Box className="items">
      {nbOfItems > 0 && (
        <>
          <Grid container spacing={2}>
            {wishlist.items.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>

          <AutoExtendedFab label="Ajouter un souhait" icon={<AddIcon />} color="secondary" onClick={() => addItem()} />
        </>
      )}

      {nbOfItems === 0 && (
        <Stack alignItems="center" gap={2} sx={{ marginTop: '50px' }}>
          <Button variant="contained" color="secondary" onClick={() => addItem()}>
            Ajouter un souhait
          </Button>
          <span>Cette liste ne contient aucun souhait.</span>
        </Stack>
      )}

      <ItemFormDialog mode="create" open={openItemFormDialog} handleClose={() => setOpenItemFormDialog(false)} />
    </Box>
  );
};
