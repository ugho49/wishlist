import type { AdminUserDetailQuery } from '../../../gql';

import PersonIcon from '@mui/icons-material/Person';
import { Avatar, styled } from '@mui/material';
import { DateTime } from 'luxon';

import { AdminDataGrid } from '../../admin/AdminDataGrid';
import { UserAccountProviderChip } from './UserAccountProviderChip';
import { getAccountProviderLabel } from './user-account-provider';

type AdminUserAccount = Extract<AdminUserDetailQuery['adminUser'], { __typename: 'UserFull' }>['accounts'][number];

type AdminListUserAccountsProps = {
  accounts: AdminUserAccount[];
};

const AccountAvatar = styled(Avatar)({
  width: 28,
  height: 28,
});

export const AdminListUserAccounts = ({ accounts }: AdminListUserAccountsProps) => (
  <AdminDataGrid
    isRowSelectable={() => false}
    localeText={{
      noRowsLabel: 'Aucun compte',
    }}
    rows={accounts}
    columns={[
      {
        field: 'pictureUrl',
        headerName: '',
        width: 52,
        sortable: false,
        filterable: false,
        display: 'flex',
        renderCell: ({ row: account }) =>
          account.pictureUrl ? (
            <AccountAvatar src={account.pictureUrl}>
              <PersonIcon />
            </AccountAvatar>
          ) : null,
      },
      {
        field: 'provider',
        headerName: 'Fournisseur',
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
);
