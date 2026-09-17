import type { GridColDef } from '@mui/x-data-grid';
import type { UserId, WishlistId } from '@wishlist/common';

import ListIcon from '@mui/icons-material/List';
import { Avatar, styled } from '@mui/material';
import { DateTime } from 'luxon';

import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { RouterLink } from '../../common/RouterLink';

/**
 * The admin event page supplies these wishlists from its own GraphQL query
 * (the event feature's `Wishlist` type). We describe only the fields the grid
 * reads here, in the camelCase GraphQL shape.
 */
export type AdminEventWishlist = {
  id: WishlistId;
  title: string;
  logoUrl?: string | null;
  config: { hideItems: boolean };
  createdAt: string;
  owner: { id: UserId; firstName: string; lastName: string };
  coOwner?: { id: UserId; firstName: string; lastName: string } | null;
};

const WishlistAvatar = styled(Avatar)({
  width: 28,
  height: 28,
});

const columns: GridColDef<AdminEventWishlist>[] = [
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
  { field: 'title', headerName: 'Titre', flex: 1, minWidth: 250 },
  {
    field: 'owner',
    headerName: 'Propriétaire',
    width: 220,
    valueGetter: (_, row) => `${row.owner.firstName} ${row.owner.lastName}`,
    renderCell: ({ row }) => (
      <RouterLink key={row.owner.id} to="/admin/users/$userId" params={{ userId: row.owner.id }}>
        {row.owner.firstName} {row.owner.lastName}
      </RouterLink>
    ),
  },
  {
    field: 'coOwner',
    headerName: 'Co-propriétaire',
    width: 220,
    valueGetter: (_, row) => `${row.coOwner?.firstName} ${row.coOwner?.lastName}`,
    renderCell: ({ row }) => {
      if (!row.coOwner) return '-';
      return (
        <RouterLink key={row.coOwner.id} to="/admin/users/$userId" params={{ userId: row.coOwner.id }}>
          {row.coOwner.firstName} {row.coOwner.lastName}
        </RouterLink>
      );
    },
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

type AdminListWishlistsForEventProps = {
  wishlists: AdminEventWishlist[];
};

export const AdminListWishlistsForEvent = ({ wishlists }: AdminListWishlistsForEventProps) => (
  <AdminDataGrid
    isRowSelectable={() => false}
    rows={wishlists}
    columns={columns}
    paginationMode="client"
    localeText={{
      noRowsLabel: 'Aucune liste',
    }}
    hideFooter
    disableColumnMenu
  />
);
