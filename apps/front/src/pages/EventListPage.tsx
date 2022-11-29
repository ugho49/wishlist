import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouterLink, useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Box, Fab, fabClasses, Grid, Theme } from '@mui/material';
import { Title } from '../components/Title';
import { EventCard } from '../components/event/EventCard';
import { Pagination } from '../components/Pagination';
import { Loader } from '../components/Loader';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

type SearchType = { page: string };

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    [`&.${fabClasses.root}`]: {
      position: 'fixed',
      bottom: 72,
      right: 16,
    },
  },
}));

export const EventListPage = () => {
  const classes = useStyles();
  const api = useApi(wishlistApiRef);
  const [totalElements, setTotalElements] = useState(0);
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchType>({ page: '1' });
  const currentPage = useMemo(() => parseInt(queryParams.page, 10), [queryParams]);
  const { value, loading } = useAsync(() => api.event.getAll({ p: currentPage }), [currentPage]);

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
      <Title>Évènements</Title>

      {loading && <Loader />}

      {!loading && (
        <Grid container spacing={2}>
          {(value?.resources || []).map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <EventCard event={event} />
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
            to="/events/new"
            variant="extended"
          >
            <AddIcon sx={{ mr: 1 }} />
            Créer un évènement
          </Fab>

          <Fab
            className={classes.fab}
            sx={{ display: { xs: 'flex', md: 'none' } }}
            color="secondary"
            component={RouterLink}
            to="/events/new"
          >
            <AddIcon />
          </Fab>
        </>
      )}

      {totalElements === 0 && !loading && (
        <div>
          {/*TODO: Message when no elements*/}
          Vous n'avez pas d'évènements
          <button>Ajouter un évènement</button>
        </div>
      )}
    </Box>
  );
};
