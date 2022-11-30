import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Box, Grid } from '@mui/material';
import { Title } from '../components/Title';
import { EventCard } from '../components/event/EventCard';
import { Pagination } from '../components/Pagination';
import { Loader } from '../components/Loader';
import AddIcon from '@mui/icons-material/Add';
import { AutoExtendedFab } from '../components/AutoExtendedFab';

type SearchType = { page: string };

export const EventListPage = () => {
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

      <Loader loading={loading}>
        <Grid container spacing={2}>
          {(value?.resources || []).map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <EventCard event={event} />
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

          <AutoExtendedFab label="Créer un évènement" icon={<AddIcon />} color="secondary" to="/events/new" />
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
