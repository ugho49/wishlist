import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { type AdminUserDetailQuery, UserAccountProvider } from '../../../gql';

type AdminUserAccount = Extract<AdminUserDetailQuery['adminUser'], { __typename: 'UserFull' }>['accounts'][number];

type AdminListUserAccountsProps = {
  accounts: AdminUserAccount[];
};

const accountProviderLabel = (provider: UserAccountProvider) =>
  match(provider)
    .with(UserAccountProvider.Password, () => 'Mot de passe')
    .with(UserAccountProvider.Google, () => 'Google')
    .with(UserAccountProvider.Facebook, () => 'Facebook')
    .exhaustive();

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
          minWidth: 150,
          valueGetter: (_, row) => accountProviderLabel(row.provider),
        },
        {
          field: 'email',
          headerName: 'Email',
          flex: 1,
          width: 350,
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
