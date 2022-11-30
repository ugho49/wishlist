import React from 'react';
import { DetailedEventDto } from '@wishlist/common-types';
import { Box, Button, Grid, Stack } from '@mui/material';
import { WishlistCard } from '../wishlist/WishlistCard';
import { AutoExtendedFab } from '../common/AutoExtendedFab';
import AddIcon from '@mui/icons-material/Add';
import { RouterLink } from '@wishlist/common-front';

export type EventTabWishlistsProps = {
  event: DetailedEventDto;
};

export const EventTabWishlists = ({ event }: EventTabWishlistsProps) => {
  const nbOfItems = event.wishlists.length;
  const addListRoute = `/wishlists/new?from-event=${event.id}`;

  return (
    <Box className="wishlists">
      {nbOfItems > 0 && (
        <>
          <Grid container spacing={2}>
            {event.wishlists.map((wishlist) => (
              <Grid item xs={12} md={6} key={wishlist.id}>
                <WishlistCard wishlist={wishlist} />
              </Grid>
            ))}
          </Grid>

          <AutoExtendedFab label="Ajouter une liste" color="secondary" icon={<AddIcon />} to={addListRoute} />
        </>
      )}

      {nbOfItems === 0 && (
        <Stack alignItems="center" gap={2} sx={{ marginTop: '50px' }}>
          <Button component={RouterLink} variant="contained" color="secondary" to={addListRoute}>
            Ajouter une liste
          </Button>
          <span>Cet évènement ne contient aucune liste.</span>
        </Stack>
      )}
    </Box>
  );
};
