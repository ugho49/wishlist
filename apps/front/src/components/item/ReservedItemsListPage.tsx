import { Alert, Box, styled } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { isRejection, rejectionMessage, useReservedItemsListPageQuery } from '../../gql';
import { Pagination } from '../common/Pagination';
import { Title } from '../common/Title';
import { EmptyReservedItemsState } from './EmptyReservedItemsState';
import { ReservedItemRow, ReservedItemRowSkeleton } from './ReservedItemRow';

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

const List = styled('ul')({
  margin: 0,
  padding: 0,
});

export const ReservedItemsListPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/reserved-items/' });
  const navigate = useNavigate();
  const { data, isLoading: loading } = useReservedItemsListPageQuery(
    { filters: { page: currentPage } },
    { select: d => d.myReservedItems },
  );
  const pagedItems = data?.__typename === 'GetReservedItemsPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const items = pagedItems?.data ?? [];
  const totalElements = pagedItems?.pagination.totalElements ?? 0;
  const totalPages = pagedItems?.pagination.totalPages;

  return (
    <Box>
      {(loading || totalElements > 0) && <Title>Cadeaux réservés</Title>}

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      {loading && (
        <List aria-busy>
          {SKELETON_KEYS.map(key => (
            <ReservedItemRowSkeleton key={key} />
          ))}
        </List>
      )}

      {!loading && items.length > 0 && (
        <List>
          {items.map(item => (
            <ReservedItemRow key={item.id} item={item} />
          ))}
        </List>
      )}

      {totalElements > 0 && (
        <Pagination
          totalPage={totalPages}
          currentPage={currentPage}
          disabled={loading}
          hide={totalPages === 1}
          onChange={value => navigate({ from: '/reserved-items/', search: prev => ({ ...prev, page: value }) })}
        />
      )}

      {totalElements === 0 && !loading && !queryRejection && <EmptyReservedItemsState sx={{ marginTop: '100px' }} />}
    </Box>
  );
};
