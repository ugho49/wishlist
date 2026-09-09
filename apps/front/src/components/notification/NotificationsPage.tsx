import { Alert, Box, Button, List, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { match } from 'ts-pattern';

import {
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useMarkAllNotificationsReadMutation,
  useMyNotificationsQuery,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { Pagination } from '../common/Pagination';
import { Title } from '../common/Title';
import { EmptyNotificationsState } from './EmptyNotificationsState';
import { NotificationListItem } from './NotificationListItem';
import { NotificationListItemSkeleton } from './NotificationListItemSkeleton';

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5'] as const;

export const NotificationsPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/notifications/' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const {
    data,
    isLoading: loading,
    refetch,
  } = useMyNotificationsQuery({ filters: { page: currentPage, limit: 20 } }, { select: d => d.myNotifications });
  const paged = data?.__typename === 'UserNotificationsPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;
  const notifications = paged?.data ?? [];
  const totalPages = paged?.pagination.totalPages;
  const unreadCount = paged?.unreadCount ?? 0;

  const { mutateAsync: markAllRead, isPending: markingAll } = useMarkAllNotificationsReadMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  const onMarkAll = async () => {
    const res = await markAllRead({});
    match(res.markAllNotificationsRead)
      .with({ __typename: 'VoidOutput' }, () => {
        void refetch();
        void queryClient.invalidateQueries({ queryKey: ['UnreadNotificationCount'] });
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Box>
      <Title>Notifications</Title>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={() => void onMarkAll()} disabled={markingAll}>
            Tout marquer comme lu
          </Button>
        )}
      </Stack>

      {queryRejection ? <Alert severity="error">{rejectionMessage(queryRejection)}</Alert> : null}

      {loading && (
        <List disablePadding>
          {SKELETON_KEYS.map(key => (
            <NotificationListItemSkeleton key={key} />
          ))}
        </List>
      )}

      {!loading && notifications.length === 0 && <EmptyNotificationsState />}

      {!loading && notifications.length > 0 && (
        <List disablePadding>
          {notifications.map(notification => (
            <NotificationListItem key={notification.id} notification={notification} />
          ))}
        </List>
      )}

      {totalPages !== undefined && totalPages > 1 && (
        <Pagination
          totalPage={totalPages}
          currentPage={currentPage}
          disabled={loading}
          hide={totalPages === 1}
          onChange={value => navigate({ from: '/notifications/', search: { page: value } })}
        />
      )}
    </Box>
  );
};
