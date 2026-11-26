import { generateRandomToken } from './random-token';
import { describe, expect, it } from 'bun:test';

describe('generateRandomToken', () => {
  it('should return a token of the requested length, made of lowercase letters and digits', () => {
    const token = generateRandomToken(20);

    expect(token).toHaveLength(20);
    expect(token).toMatch(/^[0-9a-z]{20}$/);
  });

  it('should not repeat itself', () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generateRandomToken(20)));

    expect(tokens.size).toBe(1000);
  });

  it('should use every character of the alphabet', () => {
    const characters = new Set(generateRandomToken(10_000));

    expect(characters.size).toBe(36);
  });
});
