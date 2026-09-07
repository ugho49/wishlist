import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { useUnreadNotificationCountQuery } from '../../gql';

export type NotificationBellProps = {
  color?: string;
};

export const NotificationBell = ({ color = 'inherit' }: NotificationBellProps) => {
  const navigate = useNavigate();
  const { data } = useUnreadNotificationCountQuery(undefined, {
    select: d => d.unreadNotificationCount,
    refetchInterval: 60_000,
  });
  const count = data?.__typename === 'UnreadNotificationCount' ? data.count : 0;

  return (
    <IconButton
      color="inherit"
      aria-label="notifications"
      onClick={() => navigate({ to: '/notifications' })}
      sx={{ color }}
    >
      <Badge badgeContent={count} color="error" max={9}>
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};
