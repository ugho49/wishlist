import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import GroupsIcon from '@mui/icons-material/Groups'
import { Box, Tab, Tabs } from '@mui/material'
import { useQueryState } from 'nuqs'

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

export const AdminPage = () => {
  const [tab, setTab] = useQueryState('tab', { defaultValue: TabValues.users })

  return (
    <Box>
      <Title smallMarginBottom>Administration</Title>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mb={4}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
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
        {tab === TabValues.users && <AdminListUsers />}
        {tab === TabValues.events && <AdminListEvents />}
      </CardV2>
    </Box>
  )
}
