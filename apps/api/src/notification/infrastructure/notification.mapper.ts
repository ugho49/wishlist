import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  type UserNotification as GqlUserNotification,
  UserNotificationType as GqlUserNotificationType,
} from '../../gql/generated-types';
import { UserNotification } from '../domain/model/user-notification.model';
import { UserNotificationType } from '../domain/user-notification-type.enum';

function toGqlType(type: UserNotificationType): GqlUserNotificationType {
  return match(type)
    .with(UserNotificationType.ITEM_RESERVED, () => GqlUserNotificationType.ItemReserved)
    .with(UserNotificationType.SECRET_SANTA_DRAWN, () => GqlUserNotificationType.SecretSantaDrawn)
    .with(UserNotificationType.NEW_GUEST, () => GqlUserNotificationType.NewGuest)
    .with(UserNotificationType.EVENT_REMINDER, () => GqlUserNotificationType.EventReminder)
    .exhaustive();
}

function toGqlNotification(notification: UserNotification): GqlUserNotification {
  return {
    __typename: 'UserNotification',
    id: notification.id,
    type: toGqlType(notification.type),
    title: notification.title,
    body: notification.body,
    read: notification.isRead,
    createdAt: DateTime.fromJSDate(notification.createdAt).toISO() ?? '',
    eventId: notification.eventId,
    wishlistId: notification.wishlistId,
    itemId: notification.itemId,
  };
}

export const notificationMapper = {
  toGqlNotification,
};
