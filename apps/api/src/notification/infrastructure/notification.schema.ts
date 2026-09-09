import { type UserNotificationId } from '@wishlist/common';
import z from 'zod';

export const UserNotificationIdSchema = z.string().transform(val => val as UserNotificationId);
