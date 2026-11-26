import type { GridColDef } from '@mui/x-data-grid';
import type { AdminWishlistEvent } from '../wishlist.types';

import { DateTime } from 'luxon';

import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { RouterLink } from '../../common/RouterLink';
import { EventIcon } from '../../event/EventIcon';

const columns: GridColDef<AdminWishlistEvent>[] = [
  {
    field: 'icon',
    headerName: '',
    width: 44,
    sortable: false,
    filterable: false,
    display: 'flex',
    renderCell: ({ row }) => <EventIcon icon={row.icon ?? undefined} size="small" />,
  },
  {
    field: 'title',
    headerName: 'Titre',
    flex: 1,
    minWidth: 250,
    renderCell: ({ row }) => (
      <RouterLink to="/admin/events/$eventId" params={{ eventId: row.id }}>
        {row.title}
      </RouterLink>
    ),
  },
  {
    field: 'eventDate',
    headerName: 'Date',
    type: 'dateTime',
    width: 160,
    valueGetter: (_, row) => new Date(row.eventDate),
    renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED),
  },
];

type AdminListEventsForWishlistProps = {
  events: AdminWishlistEvent[];
};

export const AdminListEventsForWishlist = ({ events }: AdminListEventsForWishlistProps) => (
  <AdminDataGrid
    isRowSelectable={() => false}
    rows={events}
    columns={columns}
    paginationMode="client"
    localeText={{
      noRowsLabel: 'Aucun évènement',
    }}
    hideFooter
    disableColumnMenu
  />
);
