import { ListItem, ListItemIcon, ListItemText, Skeleton } from '@mui/material';

export const NotificationListItemSkeleton = () => (
  <ListItem>
    <ListItemIcon>
      <Skeleton variant="circular" width={24} height={24} />
    </ListItemIcon>
    <ListItemText primary={<Skeleton width="40%" />} secondary={<Skeleton width="80%" />} />
  </ListItem>
);
