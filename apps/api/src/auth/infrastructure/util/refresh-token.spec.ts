import { durationToMs, RefreshTokenManager } from './refresh-token';
import { describe, expect, it } from 'bun:test';

describe('RefreshTokenManager', () => {
  it('should generate a unique opaque token', () => {
    const first = RefreshTokenManager.generateRaw();
    const second = RefreshTokenManager.generateRaw();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(20);
  });

  it('should hash tokens with SHA-256 hex', () => {
    const hash = RefreshTokenManager.hash('token');

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
    expect(RefreshTokenManager.hash('token')).toBe(hash);
    expect(RefreshTokenManager.hash('other')).not.toBe(hash);
  });

  it('should convert a duration string into a future date', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const expiresAt = RefreshTokenManager.durationToDate('30d', from);

    expect(expiresAt.getTime() - from.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe('durationToMs', () => {
  it.each([
    ['15m', 15 * 60 * 1000],
    ['1h', 60 * 60 * 1000],
    ['30d', 30 * 24 * 60 * 60 * 1000],
  ] as const)('should parse %s', (duration, expected) => {
    expect(durationToMs(duration)).toBe(expected);
  });

  it('should reject an invalid duration', () => {
    expect(() => durationToMs('nope')).toThrow('Invalid duration');
  });
});
