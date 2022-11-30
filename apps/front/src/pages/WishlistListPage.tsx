import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Title } from '../components/Title';
import { useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Pagination } from '../components/Pagination';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { Loader } from '../components/Loader';
import AddIcon from '@mui/icons-material/Add';
import { AutoExtendedFab } from '../components/AutoExtendedFab';

type SearchType = { page: string };

export const WishlistListPage = () => {
  const api = useApi(wishlistApiRef);
  const [totalElements, setTotalElements] = useState(0);
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchType>({ page: '1' });
  const currentPage = useMemo(() => parseInt(queryParams.page, 10), [queryParams]);
  const { value, loading } = useAsync(() => api.wishlist.getAll({ p: currentPage }), [currentPage]);

  const setCurrentPage = useCallback(
    (page: number) => {
      setQueryParams((prevState) => ({ ...prevState, page: `${page}` }));
    },
    [setQueryParams]
  );

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements);
      setCurrentPage(value.pagination.page_number);
    }
  }, [value]);

  return (
    <Box>
      <Title>Mes listes</Title>

      <Loader loading={loading}>
        <Grid container spacing={2}>
          {(value?.resources || []).map((wishlist) => (
            <Grid item xs={12} md={6} key={wishlist.id}>
              <WishlistCard wishlist={wishlist} />
            </Grid>
          ))}
        </Grid>
      </Loader>

      {totalElements > 0 && (
        <>
          <Pagination
            totalPage={value?.pagination.total_pages}
            currentPage={currentPage}
            disabled={loading}
            onChange={(value) => setCurrentPage(value)}
          />

          <AutoExtendedFab label="Créer une liste" icon={<AddIcon />} color="secondary" to="/wishlists/new" />
        </>
      )}

      {totalElements === 0 && !loading && (
        <div>
          {/*TODO: Message when no elements*/}
          Vous n'avez pas de liste
          <button>Ajouter une liste</button>
        </div>
      )}
    </Box>
  );
};
