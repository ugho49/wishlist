import type { AdminUserDetailQuery } from '../../../gql';

import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTime } from 'luxon';

import { UserAccountProviderChip } from './UserAccountProviderChip';
import { getAccountProviderLabel } from './user-account-provider';

type AdminUserAccount = Extract<AdminUserDetailQuery['adminUser'], { __typename: 'UserFull' }>['accounts'][number];

type AdminListUserAccountsProps = {
  accounts: AdminUserAccount[];
};

export const AdminListUserAccounts = ({ accounts }: AdminListUserAccountsProps) => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
    <DataGrid
      isRowSelectable={() => false}
      density="standard"
      localeText={{
        noRowsLabel: 'Aucun compte',
      }}
      rows={accounts}
      columns={[
        {
          field: 'pictureUrl',
          headerName: '',
          width: 70,
          sortable: false,
          filterable: false,
          display: 'flex',
          renderCell: ({ row: account }) =>
            account.pictureUrl ? (
              <Avatar src={account.pictureUrl} sx={{ width: '30px', height: '30px' }}>
                <PersonIcon />
              </Avatar>
            ) : (
              <Box sx={{ width: '30px', height: '30px' }} />
            ),
        },
        {
          field: 'provider',
          headerName: 'Provider',
          width: 150,
          display: 'flex',
          valueGetter: (_, row) => getAccountProviderLabel(row.provider),
          renderCell: ({ row }) => <UserAccountProviderChip provider={row.provider} />,
        },
        {
          field: 'email',
          headerName: 'Email',
          flex: 1,
          minWidth: 250,
        },
        {
          field: 'createdAt',
          headerName: 'Ajouté le',
          type: 'dateTime',
          width: 200,
          valueGetter: (_, row) => new Date(row.createdAt),
          renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
        },
      ]}
      initialState={{
        sorting: {
          sortModel: [{ field: 'createdAt', sort: 'desc' }],
        },
      }}
      paginationMode="client"
      hideFooter
      disableColumnMenu
    />
  </div>
);
