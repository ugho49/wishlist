import { Box, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import { Title } from '../common/Title';
import LockIcon from '@mui/icons-material/Lock';
import PortraitIcon from '@mui/icons-material/Portrait';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { UserTabInformations } from './UserTabInformations';
import { UserTabNotifications } from './UserTabNotifications';
import { UserTabPassword } from './UserTabPassword';
import { Card } from '../common/Card';

const tabs = [
  {
    value: 1,
    label: 'Informations',
    icon: <PortraitIcon />,
  },
  {
    value: 2,
    label: 'Notifications',
    icon: <NotificationsIcon />,
  },
  {
    value: 3,
    label: 'Mot de passe',
    icon: <LockIcon />,
  },
];

export const UserProfilePage = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      <Title smallMarginBottom>Mon Profil</Title>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((tab) => (
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
        {currentTab === 1 && <UserTabInformations />}
        {currentTab === 2 && <UserTabNotifications />}
        {currentTab === 3 && <UserTabPassword />}
      </Card>
    </Box>
  );
};
