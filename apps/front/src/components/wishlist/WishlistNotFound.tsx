import { Box, Button, Stack } from '@mui/material';
import React from 'react';
import { Title } from '../common/Title';
import { RouterLink } from '@wishlist/common-front';

export const WishlistNotFound = () => {
  return (
    <Box>
      <Title>Liste introuvable</Title>
      <Stack alignItems="center">
        <p>Cette liste n'existe pas ou bien n'est pas accessible</p>
        <p>
          <b>Plusieurs raison possible :</b> celle ci à été supprimée, vous n'avez pas les droits pour y accéder ou bien
          elle n'existe pas.
        </p>
        <Button variant="contained" component={RouterLink} to="/wishlists" color="secondary">
          Voir mes listes
        </Button>
      </Stack>
    </Box>
  );
};
