import { type AttendeeId, AttendeeRole, type EventId, type UserId } from '@wishlist/common';
import { match } from 'ts-pattern';
import z from 'zod';

import { PaginationFiltersSchema } from '../../core/graphql/common-type.schema';
import {
  type AddEventAttendeeInput,
  type AdminEventPaginationFilters,
  type CreateEventInput,
  type EventPaginationFilters,
  AttendeeRole as GqlAttendeeRole,
  type UpdateEventInput,
} from '../../gql/generated-types';

export const EventIdSchema = z.string().transform(val => val as EventId);
export const AttendeeIdSchema = z.string().transform(val => val as AttendeeId);
export const UserIdSchema = z.string().transform(val => val as UserId);

// The GraphQL AttendeeRole enum wire values (CREATOR / ADMIN / PARTICIPANT) map to the
// domain AttendeeRole enum values (creator / admin / participant).
export const GqlAttendeeRoleSchema = z.enum(GqlAttendeeRole);

export const EventPaginationFiltersSchema = PaginationFiltersSchema.extend({
  onlyFuture: z.boolean().default(false),
}) satisfies z.ZodType<EventPaginationFilters>;

export const AdminEventPaginationFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  userId: UserIdSchema.optional(),
}) satisfies z.ZodType<AdminEventPaginationFilters>;

const iconSchema = z
  .string()
  .max(10)
  .regex(/^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]+$/u, {
    message: 'icon must be a valid emoji',
  });

export const CreateEventInputSchema = z.object({
  title: z.string().nonempty().max(100),
  description: z.string().max(2000).optional(),
  icon: iconSchema.optional(),
  eventDate: z.iso.date({ message: 'eventDate must be in format YYYY-MM-DD' }),
  attendees: z
    .array(
      z.object({
        email: z.email().max(200).toLowerCase(),
        role: GqlAttendeeRoleSchema.optional(),
      }),
    )
    .optional(),
}) satisfies z.ZodType<CreateEventInput>;

export const UpdateEventInputSchema = z.object({
  title: z.string().nonempty().max(100),
  description: z.string().max(2000).optional(),
  icon: iconSchema.optional(),
  eventDate: z.iso.date({ message: 'eventDate must be in format YYYY-MM-DD' }),
}) satisfies z.ZodType<UpdateEventInput>;

export const AddEventAttendeeInputSchema = z.object({
  email: z.email().max(200).toLowerCase(),
  role: GqlAttendeeRoleSchema.optional(),
}) satisfies z.ZodType<AddEventAttendeeInput>;

// Maps GraphQL enum value (CREATOR / ADMIN / PARTICIPANT) to the domain AttendeeRole enum.
export function toDomainAttendeeRole(role: GqlAttendeeRole): AttendeeRole;
export function toDomainAttendeeRole(role?: GqlAttendeeRole): AttendeeRole | undefined;
export function toDomainAttendeeRole(role?: GqlAttendeeRole): AttendeeRole | undefined {
  if (!role) return undefined;
  return match(role)
    .with(GqlAttendeeRole.Creator, () => AttendeeRole.CREATOR)
    .with(GqlAttendeeRole.Admin, () => AttendeeRole.ADMIN)
    .with(GqlAttendeeRole.Participant, () => AttendeeRole.PARTICIPANT)
    .exhaustive();
}
