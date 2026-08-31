import type { RootState } from '../../core/store';

import DevicesIcon from '@mui/icons-material/Devices';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PortraitIcon from '@mui/icons-material/Portrait';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSelector } from 'react-redux';

import { ProfilePictureSection } from './ProfilePictureSection';
import { UserTabConnections } from './UserTabConnections';
import { UserTabInformations } from './UserTabInformations';
import { UserTabNotifications } from './UserTabNotifications';
import { UserTabPassword } from './UserTabPassword';

const ProfileSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  marginBottom: 18,
}));

const UserNameAndEmail = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
}));

const Name = styled(Box)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '1.3rem',
  color: theme.palette.text.primary,
}));

const Email = styled(Box)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

export enum TabValues {
  informations = 'informations',
  connections = 'connections',
  notifications = 'notifications',
  password = 'password',
}

const tabs = [
  {
    value: TabValues.informations,
    label: 'Informations',
    icon: <PortraitIcon />,
  },
  {
    value: TabValues.connections,
    label: 'Connexions',
    icon: <DevicesIcon />,
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
];

const mapState = (state: RootState) => state.userProfile;

export const UserProfilePage = () => {
  const theme = useTheme();
  const { tab } = useSearch({ from: '/_authenticated/_with-layout/user/profile' });
  const navigate = useNavigate({ from: '/user/profile' });
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const userState = useSelector(mapState);

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

      <Box
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, newValue) => navigate({ search: { tab: newValue as TabValues } })}
          variant="fullWidth"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map(tabItem => (
            <Tab
              key={tabItem.value}
              value={tabItem.value}
              label={smallScreen ? undefined : tabItem.label}
              iconPosition="start"
              icon={tabItem.icon}
            />
          ))}
        </Tabs>
      </Box>
      <Stack>
        {tab === TabValues.informations && <UserTabInformations />}
        {tab === TabValues.connections && <UserTabConnections />}
        {tab === TabValues.notifications && <UserTabNotifications />}
        {tab === TabValues.password && <UserTabPassword />}
      </Stack>
    </Box>
  );
};
