import z from 'zod';

import {
  type LoginInput,
  type LoginWithGoogleInput,
  type LogoutInput,
  type RefreshSessionInput,
} from '../../gql/generated-types';

export const LoginInputSchema = z.object({
  email: z.email().transform(value => value.toLowerCase()),
  password: z.string(),
}) satisfies z.ZodType<LoginInput>;

export const LoginWithGoogleInputSchema = z.object({
  code: z.string(),
  createUserIfNotExists: z.boolean(),
}) satisfies z.ZodType<LoginWithGoogleInput>;

export const RefreshSessionInputSchema = z.object({
  refreshToken: z.string().min(1),
}) satisfies z.ZodType<RefreshSessionInput>;

export const LogoutInputSchema = z.object({
  refreshToken: z.string().min(1),
}) satisfies z.ZodType<LogoutInput>;
