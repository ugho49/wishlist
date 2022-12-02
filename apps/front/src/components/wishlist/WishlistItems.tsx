import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailedWishlistDto, ItemDto } from '@wishlist/common-types';
import { ItemCard } from '../item/ItemCard';
import { Box, Button, Grid, inputBaseClasses, MenuItem, Select, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FabAutoGrow } from '../common/FabAutoGrow';
import { ItemFormDialog } from '../item/ItemFormDialog';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { InputLabel } from '../common/InputLabel';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export type WishlistTabItemsProps = {
  wishlist: DetailedWishlistDto;
};

const useStyles = makeStyles((theme: Theme) => ({
  select: {
    [`&.${inputBaseClasses.root}`]: {
      width: '100%',
      height: '35px',
    },
  },
}));

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const WishlistItems = ({ wishlist }: WishlistTabItemsProps) => {
  const classes = useStyles();
  const { currentUserId } = useSelector(mapState);
  const [openItemFormDialog, setOpenItemFormDialog] = useState(false);
  const [items, setItems] = useState<ItemDto[]>([]);
  const nbOfItems = useMemo(() => items.length, [items]);
  const ownerOfTheList = currentUserId === wishlist.owner.id;

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
          <Grid container spacing={2} sx={{ marginBottom: '40px' }}>
            <Grid item xs={12} md={6}>
              {/* TODO --> trier par */}
              <InputLabel>Trier par</InputLabel>
              <Select displayEmpty defaultValue="" className={classes.select}>
                <MenuItem value="">
                  <em>Aucun tri</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* TODO --> filtrer par */}
              <InputLabel>Filtrer par</InputLabel>
              <Select displayEmpty defaultValue="" className={classes.select}>
                <MenuItem value="">
                  <em>Aucun filtre</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <ItemCard
                  wishlist={{ id: wishlist.id, ownerId: wishlist.owner.id, hideItems: wishlist.config.hide_items }}
                  item={item}
                  handleUpdate={(newValue) => updateItem(newValue)}
                  handleDelete={() => setItems((prevState) => prevState.filter((i) => i.id !== item.id))}
                />
              </Grid>
            ))}
          </Grid>

          <FabAutoGrow
            label={ownerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
            icon={<AddIcon />}
            color="secondary"
            onClick={() => addItem()}
          />
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
        title={ownerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
        wishlistId={wishlist.id}
        open={openItemFormDialog}
        handleClose={() => setOpenItemFormDialog(false)}
        handleCreate={(item) => setItems((prevState) => [item, ...prevState])}
      />
    </Box>
  );
};
