import { camelCase } from 'lodash'

export const randomString = (length: number) =>
  [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('')

export function camelCaseKeys(object: Record<string, unknown>) {
  return Object.entries(object).reduce((acc, [key, value]) => ({ ...acc, [camelCase(key)]: value }), {})
}

export const isValidEmail = (value: string): boolean => {
  if (value.trim() === '') {
    return false
  }
  const emailRegexp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return emailRegexp.test(value)
}
