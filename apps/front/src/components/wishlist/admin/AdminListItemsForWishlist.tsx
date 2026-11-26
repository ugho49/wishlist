import type { GridColDef } from '@mui/x-data-grid';
import type { AdminWishlistItem } from '../wishlist.types';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Avatar, Link, Rating, styled } from '@mui/material';
import { DateTime } from 'luxon';

import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { RouterLink } from '../../common/RouterLink';

const ItemPicture = styled(Avatar)({
  width: 28,
  height: 28,
});

const ItemName = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const ItemLink = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  minWidth: 0,
}));

const TakersCell = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const takerName = (taker: AdminWishlistItem['takers'][number]) => `${taker.user.firstName} ${taker.user.lastName}`;

const columns: GridColDef<AdminWishlistItem>[] = [
  {
    field: 'pictureUrl',
    headerName: '',
    width: 44,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row }) => (
      <ItemPicture variant="rounded" src={row.pictureUrl ?? undefined}>
        <CardGiftcardIcon fontSize="small" />
      </ItemPicture>
    ),
  },
  {
    field: 'name',
    headerName: 'Nom',
    flex: 1,
    minWidth: 220,
    display: 'flex',
    renderCell: ({ row }) =>
      row.url ? (
        <ItemLink href={row.url} target="_blank" rel="noopener noreferrer">
          <ItemName>{row.name}</ItemName>
          <OpenInNewIcon fontSize="inherit" />
        </ItemLink>
      ) : (
        <ItemName>{row.name}</ItemName>
      ),
  },
  {
    field: 'score',
    headerName: 'Envie',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    width: 130,
    display: 'flex',
    valueGetter: (_, row) => row.score ?? 0,
    renderCell: ({ row }) => (row.score ? <Rating value={row.score} size="small" readOnly /> : '—'),
  },
  {
    field: 'isSuggested',
    headerName: 'Suggéré',
    type: 'boolean',
    width: 100,
    valueGetter: (_, row) => Boolean(row.isSuggested),
  },
  {
    field: 'takers',
    headerName: 'Réservé par',
    width: 240,
    display: 'flex',
    valueGetter: (_, row) => row.takers.map(takerName).join(', '),
    renderCell: ({ row }) => {
      if (row.takers.length === 0) return '—';
      return (
        <TakersCell title={row.takers.map(takerName).join(', ')}>
          {row.takers.map((taker, index) => (
            <span key={taker.userId}>
              {index > 0 ? ', ' : null}
              <RouterLink to="/admin/users/$userId" params={{ userId: taker.userId }}>
                {takerName(taker)}
              </RouterLink>
            </span>
          ))}
        </TakersCell>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Ajouté le',
    type: 'dateTime',
    width: 180,
    valueGetter: (_, row) => new Date(row.createdAt),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
  },
];

type AdminListItemsForWishlistProps = {
  items: AdminWishlistItem[];
};

export const AdminListItemsForWishlist = ({ items }: AdminListItemsForWishlistProps) => (
  <AdminDataGrid
    isRowSelectable={() => false}
    rows={items}
    columns={columns}
    paginationMode="client"
    localeText={{
      noRowsLabel: 'Aucun souhait',
    }}
    hideFooter
    disableColumnMenu
  />
);
