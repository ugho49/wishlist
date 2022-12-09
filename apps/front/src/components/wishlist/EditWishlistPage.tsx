import React from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Box } from '@mui/material';
import { Loader } from '../common/Loader';
import { WishlistNotFound } from './WishlistNotFound';

export const EditWishlistPage = () => {
  const params = useParams<'wishlistId'>();
  const wishlistId = params.wishlistId || '';
  const api = useApi(wishlistApiRef);

  const { value: wishlist, loading } = useAsync(() => api.wishlist.getById(wishlistId), [wishlistId]);

  return (
    <Box>
      <Loader loading={loading}>{!wishlist && <WishlistNotFound />}</Loader>
    </Box>
  );
};
