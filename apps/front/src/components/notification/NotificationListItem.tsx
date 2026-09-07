import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  type MyNotificationsQuery,
  rejectionMessage,
  rejectionPattern,
  UserNotificationType,
  useMarkNotificationReadMutation,
} from '../../gql';
import { useToast } from '../../hooks/useToast';

type NotificationItem = Extract<
  MyNotificationsQuery['myNotifications'],
  { __typename: 'UserNotificationsPagedResponse' }
>['data'][number];

const iconFor = (type: UserNotificationType) =>
  match(type)
    .with(UserNotificationType.ItemReserved, () => <CardGiftcardIcon />)
    .with(UserNotificationType.SecretSantaDrawn, () => <VolunteerActivismIcon />)
    .with(UserNotificationType.NewGuest, () => <PersonAddIcon />)
    .with(UserNotificationType.EventReminder, () => <EventIcon />)
    .otherwise(() => <NotificationsIcon />);

export type NotificationListItemProps = {
  notification: NotificationItem;
};

export const NotificationListItem = ({ notification }: NotificationListItemProps) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: markRead } = useMarkNotificationReadMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  const onClick = async () => {
    if (!notification.read) {
      const res = await markRead({ id: notification.id });
      match(res.markNotificationRead)
        .with({ __typename: 'VoidOutput' }, () => {
          void queryClient.invalidateQueries({ queryKey: ['MyNotifications'] });
          void queryClient.invalidateQueries({ queryKey: ['UnreadNotificationCount'] });
        })
        .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
        .exhaustive();
    }

    if (notification.eventId) {
      void navigate({ to: '/events/$eventId', params: { eventId: notification.eventId } });
      return;
    }
    if (notification.wishlistId) {
      void navigate({ to: '/wishlists/$wishlistId', params: { wishlistId: notification.wishlistId } });
    }
  };

  return (
    <ListItem disablePadding sx={{ opacity: notification.read ? 0.7 : 1 }}>
      <ListItemButton onClick={() => void onClick()} alignItems="flex-start">
        <ListItemIcon sx={{ color: notification.read ? 'text.secondary' : 'primary.main', mt: 0.5 }}>
          {iconFor(notification.type)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography fontWeight={notification.read ? 400 : 600} variant="body1">
              {notification.title}
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary">
                {notification.body}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {DateTime.fromISO(notification.createdAt).toRelative({ locale: 'fr' })}
              </Typography>
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};
