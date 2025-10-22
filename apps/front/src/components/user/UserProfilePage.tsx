import type { RootState } from '../../core'

import LockIcon from '@mui/icons-material/Lock'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PortraitIcon from '@mui/icons-material/Portrait'
import ShareIcon from '@mui/icons-material/Share'
import { Box, Tab, Tabs } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQueryState } from 'nuqs'
import { useSelector } from 'react-redux'

import { Card } from '../common/Card'
import { ProfilePictureSection } from './ProfilePictureSection'
import { UserTabInformations } from './UserTabInformations'
import { UserTabNotifications } from './UserTabNotifications'
import { UserTabPassword } from './UserTabPassword'
import { UserTabSocial } from './UserTabSocial'

const ProfileSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  marginBottom: 18,
}))

const UserNameAndEmail = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
}))

const Name = styled(Box)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '1.3rem',
  color: theme.palette.text.primary,
}))

const Email = styled(Box)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}))

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
    icon: <ShareIcon />,
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

const mapState = (state: RootState) => state.userProfile

export const UserProfilePage = () => {
  const theme = useTheme()
  const [tab, setTab] = useQueryState('tab', { defaultValue: TabValues.informations })
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const userState = useSelector(mapState)

  return (
    <Box>
      <ProfileSection>
        <ProfilePictureSection />

        <UserNameAndEmail>
          <Name>
            {userState.firstName} {userState.lastName}
          </Name>
          <Email>{userState.email}</Email>
        </UserNameAndEmail>
      </ProfileSection>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mb={4}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
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
        {tab === TabValues.informations && <UserTabInformations />}
        {tab === TabValues.notifications && <UserTabNotifications />}
        {tab === TabValues.social && <UserTabSocial />}
        {tab === TabValues.password && <UserTabPassword />}
      </Card>
    </Box>
  )
}
