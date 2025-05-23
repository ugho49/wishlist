import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact'
import LockIcon from '@mui/icons-material/Lock'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PortraitIcon from '@mui/icons-material/Portrait'
import { Box, Tab, Tabs } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useCustomSearchParams } from '../../hooks/useCustomSearchParams'
import { Card } from '../common/Card'
import { Title } from '../common/Title'
import { UserTabInformations } from './UserTabInformations'
import { UserTabNotifications } from './UserTabNotifications'
import { UserTabPassword } from './UserTabPassword'
import { UserTabSocial } from './UserTabSocial'

enum TabValues {
  informations = 'informations',
  notifications = 'notifications',
  social = 'social',
  password = 'password',
}

const tabs = [
  {
    value: TabValues.informations,
    label: 'Informations',
    icon: <PortraitIcon />,
  },
  {
    value: TabValues.social,
    label: 'Connexion social',
    icon: <ConnectWithoutContactIcon />,
  },
  {
    value: TabValues.notifications,
    label: 'Notifications',
    icon: <NotificationsIcon />,
  },
  {
    value: TabValues.password,
    label: 'Mot de passe',
    icon: <LockIcon />,
  },
]

type SearchParamType = { tab: TabValues }

export const UserProfilePage = () => {
  const theme = useTheme()
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0]!.value })
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box>
      <Title smallMarginBottom>Mon Profil</Title>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
        <Tabs
          value={queryParams.tab}
          onChange={(_, newValue) => setQueryParams({ tab: newValue })}
          variant="fullWidth"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map(tab => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={smallScreen ? undefined : tab.label}
              iconPosition="start"
              icon={tab.icon}
            />
          ))}
        </Tabs>
      </Box>
      <Card>
        {queryParams.tab === TabValues.informations && <UserTabInformations />}
        {queryParams.tab === TabValues.notifications && <UserTabNotifications />}
        {queryParams.tab === TabValues.social && <UserTabSocial />}
        {queryParams.tab === TabValues.password && <UserTabPassword />}
      </Card>
    </Box>
  )
}
