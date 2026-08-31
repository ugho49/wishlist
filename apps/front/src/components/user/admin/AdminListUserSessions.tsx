import type { AdminUserDetailQuery } from '../../../gql';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DevicesIcon from '@mui/icons-material/Devices';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { type DeviceType, parseUserAgent } from '../../../utils/user-agent.utils';

type AdminUserSession = Extract<AdminUserDetailQuery['adminUser'], { __typename: 'UserFull' }>['sessions'][number];

type AdminListUserSessionsProps = {
  sessions: AdminUserSession[];
  onRevoke: (sessionId: AdminUserSession['id']) => void;
  disabled?: boolean;
};

const deviceIcon = (deviceType: DeviceType) =>
  match(deviceType)
    .with('mobile', () => <PhoneIphoneIcon fontSize="small" />)
    .with('tablet', () => <TabletMacIcon fontSize="small" />)
    .with('desktop', () => <LaptopMacIcon fontSize="small" />)
    .with('unknown', () => <DevicesIcon fontSize="small" />)
    .exhaustive();

export const AdminListUserSessions = ({ sessions, onRevoke, disabled }: AdminListUserSessionsProps) => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
    <DataGrid
      isRowSelectable={() => false}
      density="standard"
      localeText={{
        noRowsLabel: 'Aucune session active',
      }}
      rows={sessions}
      columns={[
        {
          field: 'device',
          headerName: '',
          width: 60,
          sortable: false,
          filterable: false,
          display: 'flex',
          renderCell: ({ row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {deviceIcon(parseUserAgent(row.userAgent).deviceType)}
            </Box>
          ),
        },
        {
          field: 'browser',
          headerName: 'Navigateur',
          flex: 1,
          minWidth: 180,
          valueGetter: (_, row) => {
            const parsed = parseUserAgent(row.userAgent);
            return [parsed.browser, parsed.browserVersion].filter(Boolean).join(' ');
          },
        },
        {
          field: 'os',
          headerName: 'Système',
          flex: 1,
          minWidth: 160,
          valueGetter: (_, row) => {
            const parsed = parseUserAgent(row.userAgent);
            return [parsed.os, parsed.osVersion].filter(Boolean).join(' ');
          },
        },
        {
          field: 'deviceLabel',
          headerName: 'Appareil',
          minWidth: 140,
          valueGetter: (_, row) => parseUserAgent(row.userAgent).deviceLabel,
        },
        {
          field: 'ip',
          headerName: 'IP',
          minWidth: 130,
          valueGetter: (_, row) => row.ip || '—',
        },
        {
          field: 'lastUsedAt',
          headerName: 'Dernière activité',
          type: 'dateTime',
          width: 190,
          valueGetter: (_, row) => new Date(row.lastUsedAt),
          renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
        },
        {
          field: 'createdAt',
          headerName: 'Connecté le',
          type: 'dateTime',
          width: 190,
          valueGetter: (_, row) => new Date(row.createdAt),
          renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
        },
        {
          field: 'expiresAt',
          headerName: 'Expire le',
          type: 'dateTime',
          width: 190,
          valueGetter: (_, row) => new Date(row.expiresAt),
          renderCell: ({ value }) => DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED),
        },
        {
          field: 'actions',
          headerName: '',
          width: 70,
          sortable: false,
          filterable: false,
          display: 'flex',
          renderCell: ({ row }) => (
            <Tooltip title="Révoquer">
              <IconButton size="small" color="error" disabled={disabled} onClick={() => onRevoke(row.id)}>
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
        },
      ]}
      initialState={{
        sorting: {
          sortModel: [{ field: 'lastUsedAt', sort: 'desc' }],
        },
      }}
      paginationMode="client"
      hideFooter
      disableColumnMenu
    />
  </div>
);
