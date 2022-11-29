import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Fab, fabClasses, Grid } from '@mui/material';
import { Title } from '../components/Title';
import { RouterLink, useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Pagination } from '../components/Pagination';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { Loader } from '../components/Loader';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

type SearchType = { page: string };

const useStyles = makeStyles(() => ({
  fab: {
    [`&.${fabClasses.root}`]: {
      position: 'fixed',
      bottom: 72,
      right: 16,
    },
  },
}));

export const WishlistListPage = () => {
  const classes = useStyles();
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

      {loading && <Loader />}

      {!loading && (
        <Grid container spacing={2}>
          {(value?.resources || []).map((wishlist) => (
            <Grid item xs={12} md={6} key={wishlist.id}>
              <WishlistCard wishlist={wishlist} />
            </Grid>
          ))}
        </Grid>
      )}

      {totalElements > 0 && (
        <>
          <Pagination
            totalPage={value?.pagination.total_pages}
            currentPage={currentPage}
            disabled={loading}
            onChange={(value) => setCurrentPage(value)}
          />

          <Fab
            className={classes.fab}
            sx={{ display: { xs: 'none', md: 'flex' } }}
            color="secondary"
            component={RouterLink}
            to="/wishlists/new"
            variant="extended"
          >
            <AddIcon sx={{ mr: 1 }} />
            Créer une liste
          </Fab>

          <Fab
            className={classes.fab}
            sx={{ display: { xs: 'flex', md: 'none' } }}
            color="secondary"
            component={RouterLink}
            to="/wishlists/new"
          >
            <AddIcon />
          </Fab>
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
