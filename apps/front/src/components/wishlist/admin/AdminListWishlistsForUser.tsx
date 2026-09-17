import type { GridColDef } from '@mui/x-data-grid';
import type { UserId } from '@wishlist/common';
import type { AdminUserWishlistRow } from '../wishlist.types';

import ListIcon from '@mui/icons-material/List';
import { Alert, Avatar, Stack, styled } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';

import { isRejection, rejectionMessage, useAdminListWishlistsForUserQuery } from '../../../gql';
import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { RouterLink } from '../../common/RouterLink';

const WishlistAvatar = styled(Avatar)({
  width: 28,
  height: 28,
});

const getColumns = (userId: UserId): GridColDef<AdminUserWishlistRow>[] => [
  {
    field: 'logoUrl',
    headerName: '',
    width: 44,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: wishlist }) => (
      <WishlistAvatar src={wishlist.logoUrl ?? undefined}>
        <ListIcon />
      </WishlistAvatar>
    ),
  },
  { field: 'title', headerName: 'Titre', width: 250 },
  {
    field: 'events',
    headerName: 'Évènements',
    flex: 1,
    minWidth: 250,
    resizable: true,
    valueGetter: (_, row) => row.events.map(event => event.title).join(', '),
    renderCell: ({ row }) => (
      <Stack
        direction="row"
        sx={{
          gap: 1,
        }}
      >
        {row.events.map(event => (
          <RouterLink key={event.id} to="/admin/events/$eventId" params={{ eventId: event.id }}>
            {event.title}
          </RouterLink>
        ))}
      </Stack>
    ),
  },
  {
    field: 'role',
    headerName: 'Rôle',
    width: 140,
    valueGetter: (_, row) => (userId === row.coOwnerId ? 'Co-propriétaire' : 'Propriétaire'),
  },
  {
    field: 'config.hideItems',
    headerName: 'Public',
    width: 90,
    sortable: false,
    filterable: false,
    type: 'boolean',
    valueGetter: (_, row) => !row.config.hideItems,
  },
  {
    field: 'createdAt',
    headerName: 'Créé le',
    type: 'dateTime',
    width: 180,
    valueGetter: (_, row) => new Date(row.createdAt),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
];

type AdminListWishlistsForUserProps = {
  userId: UserId;
};

export const AdminListWishlistsForUser = ({ userId }: AdminListWishlistsForUserProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const columns = useMemo(() => getColumns(userId), [userId]);

  const { data, isLoading: loading } = useAdminListWishlistsForUserQuery(
    { filters: { page: currentPage, userId } },
    { select: d => d.adminWishlists, placeholderData: keepPreviousData },
  );
  const wishlists = data?.__typename === 'AdminGetWishlists' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  useEffect(() => {
    if (wishlists) {
      setTotalElements(wishlists.pagination.totalElements);
      setPageSize(wishlists.pagination.pageSize);
    }
  }, [wishlists]);

  return (
    <>
      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}
      <AdminDataGrid
        isRowSelectable={() => false}
        rows={wishlists?.data ?? []}
        loading={loading}
        columns={columns}
        paginationMode="server"
        localeText={{
          noRowsLabel: 'Aucune liste',
        }}
        rowCount={totalElements}
        paginationModel={{
          page: currentPage - 1,
          pageSize,
        }}
        pageSizeOptions={[pageSize]}
        onPaginationModelChange={({ page }) => {
          const nextPage = page + 1;
          if (nextPage === currentPage) return;
          setCurrentPage(nextPage);
        }}
        hideFooter={totalElements <= pageSize}
      />
    </>
  );
};
