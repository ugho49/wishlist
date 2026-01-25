import { parse } from 'graphql'

import { obfuscateQuery, obfuscateSensitiveData } from './graphql.plugin'

describe('GraphQL Plugin', () => {
  describe('obfuscateSensitiveData', () => {
    it('should return null when data is null', () => {
      expect(obfuscateSensitiveData(null)).toBeNull()
    })

    it('should return undefined when data is undefined', () => {
      expect(obfuscateSensitiveData(undefined)).toBeUndefined()
    })

    it('should return primitive values unchanged', () => {
      expect(obfuscateSensitiveData('string')).toBe('string')
      expect(obfuscateSensitiveData(123)).toBe(123)
      expect(obfuscateSensitiveData(true)).toBe(true)
    })

    it('should obfuscate sensitive fields in object', () => {
      const input = {
        email: 'test@test.fr',
        password: 'secret123',
      }

      expect(obfuscateSensitiveData(input)).toEqual({
        email: 'test@test.fr',
        password: '[REDACTED]',
      })
    })

    it('should obfuscate sensitive fields case-insensitively', () => {
      const input = {
        Password: 'secret',
        PASSWORD: 'secret',
        AccessToken: 'token123',
        APIKEY: 'key123',
      }

      expect(obfuscateSensitiveData(input)).toEqual({
        Password: '[REDACTED]',
        PASSWORD: '[REDACTED]',
        AccessToken: '[REDACTED]',
        APIKEY: '[REDACTED]',
      })
    })

    it.each([
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'authorization',
      'credential',
      'credentials',
      'currentPassword',
      'newPassword',
    ])('should obfuscate field: %s', fieldName => {
      const input = { [fieldName]: 'sensitive-value' }

      expect(obfuscateSensitiveData(input)).toEqual({
        [fieldName]: '[REDACTED]',
      })
    })

    it('should obfuscate nested objects', () => {
      const input = {
        user: {
          email: 'test@test.fr',
          auth: {
            password: 'secret',
            apiKey: 'key123',
          },
        },
      }

      expect(obfuscateSensitiveData(input)).toEqual({
        user: {
          email: 'test@test.fr',
          auth: {
            password: '[REDACTED]',
            apiKey: '[REDACTED]',
          },
        },
      })
    })

    it('should obfuscate entire field when field name is sensitive', () => {
      const input = {
        credentials: {
          username: 'user',
          password: 'secret',
        },
      }

      expect(obfuscateSensitiveData(input)).toEqual({
        credentials: '[REDACTED]',
      })
    })

    it('should obfuscate sensitive fields in arrays', () => {
      const input = [{ password: 'secret1' }, { password: 'secret2' }]

      expect(obfuscateSensitiveData(input)).toEqual([{ password: '[REDACTED]' }, { password: '[REDACTED]' }])
    })

    it('should handle mixed arrays with objects and primitives', () => {
      const input = ['string', 123, { password: 'secret' }, null]

      expect(obfuscateSensitiveData(input)).toEqual(['string', 123, { password: '[REDACTED]' }, null])
    })

    it('should handle deeply nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              items: [
                {
                  name: 'item1',
                  secret: 'hidden',
                },
              ],
            },
          },
        },
      }

      expect(obfuscateSensitiveData(input)).toEqual({
        level1: {
          level2: {
            level3: {
              items: [
                {
                  name: 'item1',
                  secret: '[REDACTED]',
                },
              ],
            },
          },
        },
      })
    })

    it('should handle GraphQL login mutation variables', () => {
      const input = {
        input: {
          email: 'test1@test.fr',
          password: 'test',
        },
      }

      expect(obfuscateSensitiveData(input)).toEqual({
        input: {
          email: 'test1@test.fr',
          password: '[REDACTED]',
        },
      })
    })

    it('should handle empty objects', () => {
      expect(obfuscateSensitiveData({})).toEqual({})
    })

    it('should handle empty arrays', () => {
      expect(obfuscateSensitiveData([])).toEqual([])
    })
  })

  describe('obfuscateQuery', () => {
    it('should obfuscate password in inline login mutation', () => {
      const query = parse(`
      mutation {
        login(input: {email: "test1@test.fr", password: "test"}) {
          ... on LoginOutput {
            accessToken
          }
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('email: "test1@test.fr"')
      expect(result).toContain('password: "[REDACTED]"')
      expect(result).not.toContain('password: "test"')
    })

    it('should obfuscate sensitive arguments at top level', () => {
      const query = parse(`
      mutation {
        authenticate(token: "secret-token") {
          success
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('token: "[REDACTED]"')
      expect(result).not.toContain('secret-token')
    })

    it('should obfuscate multiple sensitive fields in input object', () => {
      const query = parse(`
      mutation {
        updatePassword(input: {currentPassword: "old123", newPassword: "new456"}) {
          success
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('currentPassword: "[REDACTED]"')
      expect(result).toContain('newPassword: "[REDACTED]"')
      expect(result).not.toContain('old123')
      expect(result).not.toContain('new456')
    })

    it('should not obfuscate non-sensitive fields', () => {
      const query = parse(`
      query {
        user(id: "123") {
          email
          name
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('id: "123"')
    })

    it('should handle queries without sensitive data', () => {
      const query = parse(`
      query {
        users {
          id
          email
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('users')
      expect(result).toContain('id')
      expect(result).toContain('email')
    })

    it('should obfuscate sensitive fields case-insensitively', () => {
      const query = parse(`
      mutation {
        login(input: {email: "test@test.fr", Password: "secret"}) {
          token
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('Password: "[REDACTED]"')
      expect(result).not.toContain('"secret"')
    })

    it('should handle nested input objects', () => {
      const query = parse(`
      mutation {
        createUser(input: {profile: {name: "John"}, auth: {password: "secret123"}}) {
          id
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('name: "John"')
      expect(result).toContain('password: "[REDACTED]"')
      expect(result).not.toContain('secret123')
    })

    it('should obfuscate apiKey argument', () => {
      const query = parse(`
      mutation {
        setApiKey(apiKey: "my-secret-key") {
          success
        }
      }
    `)

      const result = obfuscateQuery(query)

      expect(result).toContain('apiKey: "[REDACTED]"')
      expect(result).not.toContain('my-secret-key')
    })
  })
})
