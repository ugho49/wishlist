import { Alert, Box, styled } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { isRejection, ReservedItemPeriod, rejectionMessage, useReservedItemsListPageQuery } from '../../gql';
import { Pagination } from '../common/Pagination';
import { Title } from '../common/Title';
import { EmptyReservedItemsState } from './EmptyReservedItemsState';
import { ReservedItemRow, ReservedItemRowSkeleton } from './ReservedItemRow';
import { type ReservedItemsPeriod, ReservedItemsPeriodSwitch } from './ReservedItemsPeriodSwitch';

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

const EMPTY_COPY: Record<ReservedItemsPeriod, { title: string; subtitle: string }> = {
  all: {
    title: 'Aucun cadeau réservé',
    subtitle: 'Les cadeaux que vous réservez sur les listes des autres apparaîtront ici.',
  },
  reserved: {
    title: 'Aucun cadeau réservé',
    subtitle: 'Les cadeaux encore liés à un évènement à venir, ou sans évènement, apparaîtront ici.',
  },
  past: {
    title: 'Aucun cadeau passé',
    subtitle: 'Les cadeaux liés à un évènement déjà terminé apparaîtront ici.',
  },
};

const PERIOD_TO_GQL: Record<ReservedItemsPeriod, ReservedItemPeriod> = {
  all: ReservedItemPeriod.All,
  reserved: ReservedItemPeriod.Reserved,
  past: ReservedItemPeriod.Past,
};

const List = styled('ul')({
  margin: 0,
  padding: 0,
});

export const ReservedItemsListPage = () => {
  const { page: currentPage, period } = useSearch({ from: '/_authenticated/_with-layout/reserved-items/' });
  const navigate = useNavigate();
  const { data, isLoading: loading } = useReservedItemsListPageQuery(
    { filters: { page: currentPage, period: PERIOD_TO_GQL[period] } },
    { select: d => d.myReservedItems },
  );
  const pagedItems = data?.__typename === 'GetReservedItemsPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const items = pagedItems?.data ?? [];
  const totalElements = pagedItems?.pagination.totalElements ?? 0;
  const totalPages = pagedItems?.pagination.totalPages;
  const emptyCopy = EMPTY_COPY[period];

  const selectPeriod = (nextPeriod: ReservedItemsPeriod) => {
    void navigate({
      from: '/reserved-items/',
      search: { page: 1, period: nextPeriod },
      replace: true,
    });
  };

  return (
    <Box>
      <Title>Cadeaux réservés</Title>
      <ReservedItemsPeriodSwitch value={period} onChange={selectPeriod} />

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
          onChange={value =>
            navigate({ from: '/reserved-items/', search: prev => ({ ...prev, page: value }), replace: true })
          }
        />
      )}

      {totalElements === 0 && !loading && !queryRejection && (
        <EmptyReservedItemsState title={emptyCopy.title} subtitle={emptyCopy.subtitle} sx={{ marginTop: '48px' }} />
      )}
    </Box>
  );
};
