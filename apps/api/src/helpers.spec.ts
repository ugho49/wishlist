import { logMixin, renameErrKey } from './helpers';
import { describe, expect, it } from 'bun:test';

describe('renameErrKey', () => {
  it('should move the framework `err` field to `error` for Datadog error tracking', () => {
    const err = new Error('boom');

    expect(renameErrKey({ status: 500, err })).toEqual({ status: 500, error: err });
  });

  it('should keep an entry that already has an `error` field', () => {
    const entry = { err: 'framework', error: new Error('app') };

    expect(renameErrKey(entry)).toBe(entry);
  });

  it('should keep an entry without `err`', () => {
    const entry = { message: 'hello' };

    expect(renameErrKey(entry)).toBe(entry);
  });
});

describe('logMixin', () => {
  it('should add the API version and no Datadog correlation outside a span', () => {
    const mixin = logMixin();

    expect(mixin).toEqual({ version: process.env.API_VERSION });
    expect(mixin).not.toHaveProperty('dd');
  });
});
