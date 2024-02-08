import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, Stack } from '@mui/material';
import { Title } from '../common/Title';
import { RouterLink } from '../common/RouterLink';
import { useApi, useCustomSearchParams } from '@wishlist-front/hooks';
import { Pagination } from '../common/Pagination';
import { Loader } from '../common/Loader';
import AddIcon from '@mui/icons-material/Add';
import { FabAutoGrow } from '../common/FabAutoGrow';
import { WishlistCardWithEvents } from './WishlistCardWithEvents';
import { useQuery } from '@tanstack/react-query';

type SearchType = { page: string };

const CREATE_LIST_ROUTE = '/wishlists/new';

export const WishlistListPage = () => {
  const api = useApi();
  const [totalElements, setTotalElements] = useState(0);
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchType>({ page: '1' });
  const currentPage = useMemo(() => parseInt(queryParams.page || '1', 10), [queryParams]);
  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['wishlists', { p: currentPage }],
    queryFn: () => api.wishlist.getAll({ p: currentPage }),
  });

  const setCurrentPage = useCallback(
    (page: number) => {
      setQueryParams((prevState) => ({ ...prevState, page: `${page}` }));
    },
    [setQueryParams],
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
        <Grid container spacing={3}>
          {(value?.resources || []).map((wishlist) => (
            <Grid item xs={12} md={6} key={wishlist.id}>
              <WishlistCardWithEvents wishlist={wishlist} />
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
            hide={value?.pagination.total_pages === 1}
            onChange={(value) => setCurrentPage(value)}
          />

          <FabAutoGrow label="Créer une liste" icon={<AddIcon />} color="secondary" to={CREATE_LIST_ROUTE} />
        </>
      )}

      {totalElements === 0 && !loading && (
        <Stack alignItems="center" gap={2} sx={{ marginTop: '50px' }}>
          <span>Vous n'avez aucune liste pour le moment.</span>
          <Button component={RouterLink} variant="contained" color="secondary" to={CREATE_LIST_ROUTE}>
            Ajouter une liste
          </Button>
        </Stack>
      )}
    </Box>
  );
};
