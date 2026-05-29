import type {
  AddSecretSantaUsersInput,
  CreateSecretSantaInput,
  UpdateSecretSantaInput,
  UpdateSecretSantaUserInput,
} from '../../gql/generated-types'

import { AttendeeId, EventId, SecretSantaId, SecretSantaUserId } from '@wishlist/common'
import z from 'zod'

export const SecretSantaIdSchema = z.string().transform(val => val as SecretSantaId)
export const SecretSantaUserIdSchema = z.string().transform(val => val as SecretSantaUserId)
export const EventIdSchema = z.string().transform(val => val as EventId)
export const AttendeeIdSchema = z.string().transform(val => val as AttendeeId)

export const CreateSecretSantaInputSchema = z.object({
  eventId: EventIdSchema,
  description: z.string().optional(),
  budget: z.number().int().positive().optional(),
}) satisfies z.ZodType<CreateSecretSantaInput>

export const UpdateSecretSantaInputSchema = z.object({
  description: z.string().optional(),
  budget: z.number().int().positive().optional(),
}) satisfies z.ZodType<UpdateSecretSantaInput>

// Dedupe array inputs to match the REST DTOs (@Transform(uniq)); without this, duplicate ids in a
// single request create duplicate SecretSantaUser rows (canAddUsers only guards existing members).
export const AddSecretSantaUsersInputSchema = z.object({
  attendeeIds: z
    .array(AttendeeIdSchema)
    .min(1)
    .transform(ids => [...new Set(ids)]),
}) satisfies z.ZodType<AddSecretSantaUsersInput>

export const UpdateSecretSantaUserInputSchema = z.object({
  exclusions: z.array(SecretSantaUserIdSchema).transform(ids => [...new Set(ids)]),
}) satisfies z.ZodType<UpdateSecretSantaUserInput>
