import React from 'react';
import { DetailedWishlistDto } from '@wishlist/common-types';
import { ItemCard } from '../item/ItemCard';
import { Box, Button, Fab, fabClasses } from '@mui/material';
import { Pagination } from '../Pagination';
import { RouterLink } from '@wishlist/common-front';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

export type WishlistItemsProps = {
  wishlist: DetailedWishlistDto;
};

const useStyles = makeStyles(() => ({
  fab: {
    [`&.${fabClasses.root}`]: {
      position: 'fixed',
      bottom: 72,
      right: 16,
    },
  },
}));

export const WishlistItems = ({ wishlist }: WishlistItemsProps) => {
  const classes = useStyles();

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

      {wishlist.items.length > 0 && (
        <>
          <Fab
            sx={{ display: { xs: 'none', md: 'flex' } }}
            className={classes.fab}
            color="secondary"
            variant="extended"
          >
            <AddIcon sx={{ mr: 1 }} />
            Ajouter un souhait
          </Fab>

          <Fab sx={{ display: { xs: 'flex', md: 'none' } }} className={classes.fab} color="secondary">
            <AddIcon />
          </Fab>
        </>
      )}
    </Box>
  );
};
