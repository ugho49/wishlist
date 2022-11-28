import React, { useCallback, useEffect, useMemo } from 'react';
import { Box, Pagination } from '@mui/material';
import { Title } from '../components/Title';
import { useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';

type SearchType = { page: string };

export const WishlistListPage = () => {
  const api = useApi(wishlistApiRef);
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
      setCurrentPage(value.pagination.page_number);
    }
  }, [value]);

  return (
    <Box>
      <Title>Mes listes</Title>

      {(value?.resources || []).map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}

      {/*  TODO: Hide Pagination when not needed */}
      <Pagination
        count={value?.pagination.total_pages || 1}
        page={currentPage}
        color="primary"
        disabled={loading}
        onChange={(_, value) => setCurrentPage(value)}
      />
      {/*  TODO: Floating button*/}
    </Box>
  );
};
