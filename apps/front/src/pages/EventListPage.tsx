import React, { useCallback, useEffect, useMemo } from 'react';
import { useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Box, Grid } from '@mui/material';
import { Title } from '../components/Title';
import { EventCard } from '../components/event/EventCard';
import { Pagination } from '../components/Pagination';

type SearchType = { page: string };

export const EventListPage = () => {
  const api = useApi(wishlistApiRef);
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
      setCurrentPage(value.pagination.page_number);
    }
  }, [value]);

  return (
    <Box>
      <Title>Évènements</Title>

      <Grid container spacing={2}>
        {(value?.resources || []).map((event) => (
          <Grid item xs={12} md={6} key={event.id}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>

      {/*  TODO: Hide Pagination when no elements */}
      <Pagination
        totalPage={value?.pagination.total_pages}
        currentPage={currentPage}
        disabled={loading}
        onChange={(value) => setCurrentPage(value)}
      />
      {/*  TODO: Floating button*/}
    </Box>
  );
};
