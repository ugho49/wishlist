const ARGON2_ALGORITHM = 'argon2id';

export class PasswordManager {
  private static dummyHashPromise?: Promise<string>;

  public static hash(plainPassword: string): Promise<string> {
    return Bun.password.hash(plainPassword, { algorithm: ARGON2_ALGORITHM });
  }

  public static async verify(params: { hash?: string; plainPassword: string }): Promise<boolean> {
    const { hash, plainPassword } = params;

    if (!hash) return false;

    try {
      if (hash.startsWith('{bcrypt}')) {
        return await Bun.password.verify(plainPassword, hash.replace('{bcrypt}', ''), 'bcrypt');
      }

      const argon2Hash = hash.startsWith('{argon2}') ? hash.replace('{argon2}', '') : hash;
      return await Bun.password.verify(plainPassword, argon2Hash, ARGON2_ALGORITHM);
    } catch {
      return false;
    }
  }

  /**
   * Spends the time of a real password check, for a caller without a hash to check (unknown email,
   * account without password), so that the answer does not tell whether the account exists. Always
   * false: the hash is the one of a random secret, made once.
   */
  public static async verifyWithoutHash(plainPassword: string): Promise<false> {
    PasswordManager.dummyHashPromise ??= PasswordManager.hash(crypto.randomUUID());
    await PasswordManager.verify({ hash: await PasswordManager.dummyHashPromise, plainPassword });
    return false;
  }
}
