import React, { useMemo } from 'react';
import { DetailedEventDto } from '@wishlist/common-types';
import { Box, Button, Grid, Stack } from '@mui/material';
import { FabAutoGrow } from '../common/FabAutoGrow';
import AddIcon from '@mui/icons-material/Add';
import { RouterLink } from '../common/RouterLink';
import { InputLabel } from '../common/InputLabel';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { WishlistCardWithOwner } from '../wishlist/WishlistCardWithOwner';

export type EventWishlistsProps = {
  event: DetailedEventDto;
};

export const EventWishlists = ({ event }: EventWishlistsProps) => {
  const nbOfItems = useMemo(() => event.wishlists.length, [event]);
  const addListRoute = useMemo(() => `/wishlists/new?from-event=${event.id}`, [event]);

  return (
    <Box className="wishlists">
      {nbOfItems > 0 && (
        <>
          <InputLabel sx={{ gap: '6px' }}>
            <FormatListBulletedIcon fontSize="small" />
            <span>Listes</span>
          </InputLabel>

          <Grid container spacing={3}>
            {event.wishlists
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((wishlist) => (
                <Grid item xs={12} md={6} key={wishlist.id}>
                  <WishlistCardWithOwner wishlist={wishlist} />
                </Grid>
              ))}
          </Grid>

          <FabAutoGrow label="Ajouter une liste" color="secondary" icon={<AddIcon />} to={addListRoute} />
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
