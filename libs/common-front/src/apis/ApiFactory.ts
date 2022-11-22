import { ApiRef } from './ApiRef';

export type ApiFactory<Api, Impl extends Api> = {
  api: ApiRef<Api>;
  factory(): Impl;
};

export type AnyApiFactory = ApiFactory<unknown, unknown>;

export function createApiFactory<Api, Impl extends Api>(
  factory: ApiFactory<Api, Impl> | ApiRef<Api>,
  instance?: Impl
): ApiFactory<Api, Impl> {
  if ('id' in factory) {
    return {
      api: factory,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      factory: () => instance!,
    };
  }
  return factory;
}
