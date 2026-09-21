import type { MailPayload } from '../mail/mail.type';

export enum QueueName {
  MAILS = 'mails',
  ITEMS_NOTIFICATIONS = 'items-notifications',
  USER_SESSION_CLEANUP = 'user-session-cleanup',
  BIRTHDAY_REMINDERS = 'birthday-reminders',
}

export type QueueNamePayloadMap = {
  [QueueName.MAILS]: MailPayload;
  [QueueName.ITEMS_NOTIFICATIONS]: never;
  [QueueName.USER_SESSION_CLEANUP]: never;
  [QueueName.BIRTHDAY_REMINDERS]: never;
};
