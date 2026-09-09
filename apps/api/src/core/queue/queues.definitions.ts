import type { MailPayload } from '../mail/mail.type';

export enum QueueName {
  MAILS = 'mails',
  ITEMS_NOTIFICATIONS = 'items-notifications',
  CALENDAR_REMINDERS = 'calendar-reminders',
  EVENT_REMINDERS = 'event-reminders',
  USER_SESSION_CLEANUP = 'user-session-cleanup',
}

export type QueueNamePayloadMap = {
  [QueueName.MAILS]: MailPayload;
  [QueueName.ITEMS_NOTIFICATIONS]: never;
  [QueueName.CALENDAR_REMINDERS]: never;
  [QueueName.EVENT_REMINDERS]: never;
  [QueueName.USER_SESSION_CLEANUP]: never;
};
