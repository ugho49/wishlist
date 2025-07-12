import * as argon2 from 'argon2'
import * as bcrypt from 'bcrypt'

export class PasswordManager {
  public static hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword)
  }

  public static async verify(params: { hash?: string; plainPassword: string }): Promise<boolean> {
    const { hash, plainPassword } = params

    if (!hash) return false

    try {
      if (hash.startsWith('{bcrypt}')) {
        return await bcrypt.compare(plainPassword, hash.replace('{bcrypt}', ''))
      }

      if (hash.startsWith('{argon2}')) {
        return await argon2.verify(hash.replace('{argon2}', ''), plainPassword)
      }

      return await argon2.verify(hash, plainPassword)
    } catch {
      return false
    }
  }
}
