import type { UserId } from '@wishlist/common';
import type { AdminUserWishlistRow } from '../wishlist.types';

import ListIcon from '@mui/icons-material/List';
import { Alert, Avatar, Stack } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { isRejection, rejectionMessage, useAdminListWishlistsForUserQuery } from '../../../gql';
import { RouterLink } from '../../common/RouterLink';

const getColumns = (userId: UserId): GridColDef<AdminUserWishlistRow>[] => [
  {
    field: 'logoUrl',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row: wishlist }) => (
      <Avatar src={wishlist.logoUrl ?? undefined} sx={{ width: '30px', height: '30px' }}>
        <ListIcon />
      </Avatar>
    ),
  },
  { field: 'title', headerName: 'Title', width: 250 },
  {
    field: 'events',
    headerName: 'Events',
    flex: 1,
    minWidth: 250,
    resizable: true,
    valueGetter: (_, row) => row.events.map(event => event.title).join(', '),
    renderCell: ({ row }) => (
      <Stack gap={1} direction="row">
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
    headerName: 'Role',
    width: 100,
    valueGetter: (_, row) => (userId === row.coOwnerId ? 'Co-owner' : 'Owner'),
  },
  {
    field: 'config.hideItems',
    headerName: 'Is Public',
    width: 100,
    sortable: false,
    filterable: false,
    type: 'boolean',
    valueGetter: (_, row) => !row.config.hideItems,
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    type: 'dateTime',
    width: 200,
    valueGetter: (_, row) => new Date(row.createdAt),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
];

type AdminListWishlistsForUserProps = {
  userId: UserId;
};

export const AdminListWishlistsForUser = ({ userId }: AdminListWishlistsForUserProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading: loading } = useAdminListWishlistsForUserQuery(
    { filters: { page: currentPage, userId } },
    { select: d => d.adminWishlists },
  );
  const wishlists = data?.__typename === 'AdminGetWishlists' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const totalElements = wishlists?.pagination.totalElements ?? 0;
  const pageSize = wishlists?.pagination.pageSize ?? 0;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}
      <DataGrid
        isRowSelectable={() => false}
        density="standard"
        rows={wishlists?.data ?? []}
        loading={loading}
        columns={getColumns(userId)}
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
        onPaginationModelChange={({ page }) => setCurrentPage(page + 1)}
        hideFooter={totalElements <= pageSize}
      />
    </div>
  );
};
