import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouterLink } from '../common/RouterLink';
import { useAsync } from 'react-use';
import { Box, Button, Grid, Stack } from '@mui/material';
import { Title } from '../common/Title';
import { EventCard } from './EventCard';
import { Pagination } from '../common/Pagination';
import { Loader } from '../common/Loader';
import AddIcon from '@mui/icons-material/Add';
import { FabAutoGrow } from '../common/FabAutoGrow';
import { useApi, useCustomSearchParams } from '@wishlist-front/hooks';

type SearchType = { page: string };

const CREATE_EVENT_ROUTE = '/events/new';

export const EventListPage = () => {
  const api = useApi();
  const [totalElements, setTotalElements] = useState(0);
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchType>({ page: '1' });
  const currentPage = useMemo(() => parseInt(queryParams.page || '1', 10), [queryParams]);
  const { value, loading } = useAsync(() => api.event.getAll({ p: currentPage }), [currentPage]);

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
      <Title>Évènements</Title>

      <Loader loading={loading}>
        <Grid container spacing={3}>
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
            hide={value?.pagination.total_pages === 1}
            onChange={(value) => setCurrentPage(value)}
          />

          <FabAutoGrow label="Créer un évènement" icon={<AddIcon />} color="secondary" to={CREATE_EVENT_ROUTE} />
        </>
      )}

      {totalElements === 0 && !loading && (
        <Stack alignItems="center" gap={2} sx={{ marginTop: '50px' }}>
          <span>Vous n'avez pas d'évènements pour le moment.</span>
          <Button component={RouterLink} variant="contained" color="secondary" to={CREATE_EVENT_ROUTE}>
            Ajouter un évènement
          </Button>
        </Stack>
      )}
    </Box>
  );
};
