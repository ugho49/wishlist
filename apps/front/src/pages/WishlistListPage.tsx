import React, { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { Title } from '../components/Title';
import { useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Pagination } from '../components/Pagination';

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
