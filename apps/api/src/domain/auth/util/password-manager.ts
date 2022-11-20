import * as argon2 from 'argon2';

export class PasswordManager {
  public static hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword);
  }

  public static verify(hash: string, plainPassword: string): Promise<boolean> {
    return argon2.verify(hash, plainPassword);
  }
}
