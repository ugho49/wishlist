import { createHash, randomBytes } from 'node:crypto';

const DURATION_MULTIPLIERS = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

type DurationUnit = keyof typeof DURATION_MULTIPLIERS;

export const RefreshTokenManager = {
  generateRaw(): string {
    return randomBytes(32).toString('base64url');
  },

  hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  },

  durationToDate(duration: string, from = new Date()): Date {
    return new Date(from.getTime() + durationToMs(duration));
  },
};

export function durationToMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration);
  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid duration: ${duration}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as DurationUnit;
  return amount * DURATION_MULTIPLIERS[unit];
}
