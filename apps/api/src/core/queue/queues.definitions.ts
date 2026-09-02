import type { MailPayload } from '../mail/mail.type';

export enum QueueName {
  MAILS = 'mails',
  ITEMS_NOTIFICATIONS = 'items-notifications',
}

export type QueueNamePayloadMap = {
  [QueueName.MAILS]: MailPayload;
  [QueueName.ITEMS_NOTIFICATIONS]: never;
};
