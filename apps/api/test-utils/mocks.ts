import type { Mock } from 'bun:test';

import { jest } from 'bun:test';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : unknown extends T[P]
        ? T[P]
        : DeepPartial<T[P]>;
};

export type PartialFuncReturn<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer U
    ? (...args: A) => PartialFuncReturn<U>
    : DeepPartial<T[K]>;
};

type IsExactlyUnknown<T> = unknown extends T ? (T extends object ? false : true) : false;

export type DeepMocked<T> = {
  [K in keyof T]: IsExactlyUnknown<T[K]> extends true
    ? // biome-ignore lint/suspicious/noExplicitAny: deep mock utility
      any
    : NonNullable<T[K]> extends (...args: infer A) => infer U
      ? Mock<(...args: A) => U> & ((...args: A) => DeepMocked<U>)
      : NonNullable<T[K]> extends object
        ? undefined extends T[K]
          ? DeepMocked<NonNullable<T[K]>> | undefined
          : DeepMocked<T[K]>
        : T[K];
} & T;

const createObjectProxy = <T extends object>(partial: T): T => {
  // biome-ignore lint/suspicious/noExplicitAny: deep mock utility
  const cache = new Map<string | number | symbol, any>();
  return new Proxy(partial, {
    get: (obj, prop) => {
      if (
        prop === 'inspect' ||
        prop === 'then' ||
        prop === 'asymmetricMatch' ||
        (typeof prop === 'symbol' && prop.toString() === 'Symbol(util.inspect.custom)')
      ) {
        return;
      }

      if (cache.has(prop)) {
        return cache.get(prop);
      }

      // biome-ignore lint/suspicious/noExplicitAny: deep mock utility
      let value: any;

      if (prop in obj) {
        const existing = Reflect.get(obj, prop);
        if (typeof existing === 'function') {
          // biome-ignore lint/suspicious/noExplicitAny: deep mock utility
          value = jest.fn(existing as (...args: any[]) => any);
        } else if (typeof existing === 'object' && existing !== null) {
          value = createObjectProxy(existing);
        } else {
          value = existing;
        }
      } else if (prop === 'constructor') {
        value = () => undefined;
      } else {
        // Auto-create jest.fn() for unknown properties (methods on the mocked interface).
        // Uses real jest.fn() — not a Proxy — so Bun's expect matchers work.
        value = jest.fn();
      }

      cache.set(prop, value);
      return value;
    },
    set: (_obj, prop, newValue) => {
      cache.set(prop, newValue);
      return true;
    },
  });
};

export type MockOptions = {
  readonly name?: string;
  readonly strict?: boolean;
};

export const createMock = <T extends object>(
  partial: PartialFuncReturn<T> = {},
  _options: MockOptions = {},
): DeepMocked<T> => createObjectProxy(partial as T) as DeepMocked<T>;
