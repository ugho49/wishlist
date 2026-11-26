import { PasswordManager } from './password-manager';
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

describe('PasswordManager', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('verify', () => {
    it('should accept the password of the hash and refuse another one', async () => {
      const hash = await PasswordManager.hash('Secret123!');

      expect(await PasswordManager.verify({ hash, plainPassword: 'Secret123!' })).toBe(true);
      expect(await PasswordManager.verify({ hash, plainPassword: 'Other123!' })).toBe(false);
    });

    it('should refuse without a hash', async () => {
      expect(await PasswordManager.verify({ plainPassword: 'Secret123!' })).toBe(false);
    });
  });

  describe('verifyWithoutHash', () => {
    it('should run a real argon2 check and always refuse', async () => {
      const verify = spyOn(Bun.password, 'verify');

      expect(await PasswordManager.verifyWithoutHash('Secret123!')).toBe(false);
      expect(verify).toHaveBeenCalledWith('Secret123!', expect.stringMatching(/^\$argon2id\$/), 'argon2id');
    });

    it('should hash its random secret only once', async () => {
      await PasswordManager.verifyWithoutHash('warm-up');
      const hash = spyOn(Bun.password, 'hash');

      await PasswordManager.verifyWithoutHash('Secret123!');
      await PasswordManager.verifyWithoutHash('Other123!');

      expect(hash).not.toHaveBeenCalled();
    });
  });
});
