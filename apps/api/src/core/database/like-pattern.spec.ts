import { containsPattern, escapeLike } from './like-pattern';
import { describe, expect, it } from 'bun:test';

describe('like-pattern', () => {
  describe('escapeLike', () => {
    it('should leave a value without wildcard untouched', () => {
      expect(escapeLike('jean.dupont@gmail.com')).toBe('jean.dupont@gmail.com');
    });

    it('should escape the percent and underscore wildcards', () => {
      expect(escapeLike('__')).toBe('\\_\\_');
      expect(escapeLike('%a%')).toBe('\\%a\\%');
    });

    it('should escape the escape character itself', () => {
      expect(escapeLike('a\\b')).toBe('a\\\\b');
    });
  });

  describe('containsPattern', () => {
    it('should wrap the escaped value in wildcards', () => {
      expect(containsPattern('j_d')).toBe('%j\\_d%');
    });
  });
});
