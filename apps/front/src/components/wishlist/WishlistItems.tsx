import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailedWishlistDto, ItemDto } from '@wishlist/common-types';
import { ItemCard } from '../item/ItemCard';
import { Box, Button, Grid, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FabAutoGrow } from '../common/FabAutoGrow';
import { ItemFormDialog } from '../item/ItemFormDialog';

export type WishlistTabItemsProps = {
  wishlist: DetailedWishlistDto;
};

export const WishlistItems = ({ wishlist }: WishlistTabItemsProps) => {
  const [openItemFormDialog, setOpenItemFormDialog] = useState(false);
  const [items, setItems] = useState<ItemDto[]>([]);
  const nbOfItems = useMemo(() => items.length, [items]);

  useEffect(() => {
    setItems(wishlist.items);
  }, [wishlist]);

  const addItem = () => {
    setOpenItemFormDialog(true);
  };

  const updateItem = useCallback(
    (updatedItem: ItemDto) => {
      const copy = [...items];
      const index = copy.findIndex((item) => item.id === updatedItem.id);
      copy[index] = updatedItem;
      setItems(copy);
    },
    [items]
  );

  return (
    <Box className="items">
      {nbOfItems > 0 && (
        <>
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <ItemCard
                  wishlistId={wishlist.id}
                  item={item}
                  handleUpdate={(newValue) => updateItem(newValue)}
                  handleDelete={() => setItems((prevState) => prevState.filter((i) => i.id !== item.id))}
                />
              </Grid>
            ))}
          </Grid>

          <FabAutoGrow label="Ajouter un souhait" icon={<AddIcon />} color="secondary" onClick={() => addItem()} />
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

      <ItemFormDialog
        mode="create"
        wishlistId={wishlist.id}
        open={openItemFormDialog}
        handleClose={() => setOpenItemFormDialog(false)}
        handleCreate={(item) => setItems((prevState) => [item, ...prevState])}
      />
    </Box>
  );
};
