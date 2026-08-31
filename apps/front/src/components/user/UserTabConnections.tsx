import { Stack, styled } from '@mui/material';

import { UserTabSessions } from './UserTabSessions';
import { UserTabSocial } from './UserTabSocial';

const ConnectionsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}));

export const UserTabConnections = () => (
  <ConnectionsStack>
    <UserTabSocial />
    <UserTabSessions />
  </ConnectionsStack>
);
