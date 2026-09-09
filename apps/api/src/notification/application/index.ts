import { MarkAllNotificationsReadUseCase } from './command/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from './command/mark-notification-read.use-case';
import { NotifyEventRemindersUseCase } from './command/notify-event-reminders.use-case';
import { AttendeeAddedNotificationHandler } from './event/attendee-added-notification.handler';
import { ItemReservedHandler } from './event/item-reserved.handler';
import { SecretSantaStartedNotificationHandler } from './event/secret-santa-started-notification.handler';
import { GetMyNotificationsUseCase } from './query/get-my-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './query/get-unread-notification-count.use-case';

export const handlers = [
  GetMyNotificationsUseCase,
  GetUnreadNotificationCountUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
  NotifyEventRemindersUseCase,
  ItemReservedHandler,
  AttendeeAddedNotificationHandler,
  SecretSantaStartedNotificationHandler,
];
