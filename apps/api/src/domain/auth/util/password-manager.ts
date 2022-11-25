import * as argon2 from 'argon2';

export class PasswordManager {
  public static hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword);
  }

  public static async verify(hash: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hash.replace('{argon2}', ''), plainPassword);
    } catch (e) {
      return false;
    }
  }
}
