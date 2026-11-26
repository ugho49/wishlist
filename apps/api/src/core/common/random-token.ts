const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
/** Largest multiple of the alphabet size a byte can hold: bytes above it are drawn again, so every character is equally likely. */
const UNBIASED_BYTE_LIMIT = 256 - (256 % ALPHABET.length);

/**
 * A token of lowercase letters and digits from a cryptographically secure source, for the codes
 * sent by email (reset password, email change): `Math.random()` can be predicted from its outputs.
 */
export function generateRandomToken(length: number): string {
  let token = '';

  while (token.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < UNBIASED_BYTE_LIMIT && token.length < length) {
        token += ALPHABET[byte % ALPHABET.length];
      }
    }
  }

  return token;
}
