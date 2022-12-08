import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailedWishlistDto, ItemDto } from '@wishlist/common-types';
import { ItemCard } from '../item/ItemCard';
import { Box, Button, Grid, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FabAutoGrow } from '../common/FabAutoGrow';
import { ItemFormDialog } from '../item/ItemFormDialog';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { FilterType, SortType, WishlistFilterAndSortItems } from './WishlistFilterAndSortItems';
import { InputLabel } from '../common/InputLabel';
import CategoryIcon from '@mui/icons-material/Category';

export type WishlistTabItemsProps = {
  wishlist: DetailedWishlistDto;
};

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const WishlistItems = ({ wishlist }: WishlistTabItemsProps) => {
  const { currentUserId } = useSelector(mapState);
  const [openItemFormDialog, setOpenItemFormDialog] = useState(false);
  const [sort, setSort] = useState<SortType>(SortType.CREATED_AT_DESC);
  const [filter, setFilter] = useState<FilterType>(FilterType.NONE);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [itemsFilteredAndSorted, setItemsFilteredAndSorted] = useState<ItemDto[]>([]);
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
          <WishlistFilterAndSortItems
            displayFilterSelect={!ownerOfTheList}
            items={items}
            sort={sort}
            filter={filter}
            onChange={(newItems) => setItemsFilteredAndSorted(newItems)}
            onSortChange={(newSort) => setSort(newSort)}
            onFilterChange={(newFilter) => setFilter(newFilter)}
          />

          <InputLabel sx={{ gap: '6px' }}>
            <CategoryIcon fontSize="small" />
            <span>Souhaits</span>
          </InputLabel>

          <Grid container spacing={2}>
            {itemsFilteredAndSorted.map((item) => (
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
