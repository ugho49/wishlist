import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import GroupsIcon from '@mui/icons-material/Groups'
import { Box, Tab, Tabs } from '@mui/material'

import { useCustomSearchParams } from '../../hooks/useCustomSearchParams'
import { CardV2 } from '../common/CardV2'
import { Title } from '../common/Title'
import { AdminListEvents } from '../event/admin/AdminListEvents'
import { AdminListUsers } from '../user/admin/AdminListUsers'

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
]

type SearchParamType = { tab: TabValues }

export const AdminPage = () => {
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0]!.value })

  return (
    <Box>
      <Title smallMarginBottom>Administration</Title>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mb={4}>
        <Tabs
          value={queryParams.tab}
          onChange={(_, newValue) => setQueryParams({ tab: newValue })}
          variant="fullWidth"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map(tab => (
            <Tab key={tab.value} value={tab.value} iconPosition="start" icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      <CardV2>
        {queryParams.tab === TabValues.users && <AdminListUsers />}
        {queryParams.tab === TabValues.events && <AdminListEvents />}
      </CardV2>
    </Box>
  )
}
