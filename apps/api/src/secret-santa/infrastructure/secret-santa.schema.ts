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
  budget: z.number().positive().optional(),
}) satisfies z.ZodType<CreateSecretSantaInput>

export const UpdateSecretSantaInputSchema = z.object({
  description: z.string().optional(),
  budget: z.number().positive().optional(),
}) satisfies z.ZodType<UpdateSecretSantaInput>

export const AddSecretSantaUsersInputSchema = z.object({
  attendeeIds: z.array(AttendeeIdSchema),
}) satisfies z.ZodType<AddSecretSantaUsersInput>

export const UpdateSecretSantaUserInputSchema = z.object({
  exclusionIds: z.array(SecretSantaUserIdSchema),
}) satisfies z.ZodType<UpdateSecretSantaUserInput>
