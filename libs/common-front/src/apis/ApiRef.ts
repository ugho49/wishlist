export type ApiRef<T> = { id: string; T: T };

export type ApiRefConfig = { id: string };

export function createApiRef<T>(config: ApiRefConfig): ApiRef<T> {
  return new ApiRefImpl<T>(config);
}

class ApiRefImpl<T> implements ApiRef<T> {
  constructor(private readonly config: ApiRefConfig) {
    const valid = config.id
      .split('.')
      .flatMap((part) => part.split('-'))
      .every((part) => part.match(/^[a-z][a-z0-9]*$/));
    if (!valid) {
      throw new Error(
        `API id must only contain period separated lowercase alphanum tokens with dashes, got '${config.id}'`
      );
    }
  }

  get id(): string {
    return this.config.id;
  }

  // Utility for getting type of an api, using `typeof apiRef.T`
  get T(): T {
    throw new Error(`tried to read ApiRef.T of ${this}`);
  }

  toString() {
    return `apiRef{${this.config.id}}`;
  }
}
