import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { Title } from '../common/Title';
import { useCustomSearchParams } from '@wishlist/common-front';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import { Card } from '../common/Card';
import { AdminListUsers } from '../user/admin/AdminListUsers';
import { AdminListEvents } from '../event/admin/AdminListEvents';

enum TabValues {
  users = 'users',
  events = 'events',
}

const tabs = [
  {
    value: TabValues.users,
    label: 'Utilisateurs',
    icon: <GroupsIcon />,
  },
  {
    value: TabValues.events,
    label: 'Évènements',
    icon: <CalendarMonthIcon />,
  },
];

type SearchParamType = { tab: TabValues };

export const AdminPage = () => {
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0].value });

  return (
    <Box>
      <Title smallMarginBottom>Administration</Title>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
        <Tabs
          value={queryParams.tab}
          onChange={(_, newValue) => setQueryParams({ tab: newValue })}
          variant="fullWidth"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} iconPosition="start" icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      <Card>
        {queryParams.tab === TabValues.users && <AdminListUsers />}
        {queryParams.tab === TabValues.events && <AdminListEvents />}
      </Card>
    </Box>
  );
};
