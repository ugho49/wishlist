import { v4 } from 'uuid';
import { camelCase } from 'lodash';

export const randomString = (length: number) =>
  [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('');

export const uuid = () => v4();

export function camelCaseKeys(object: any) {
  return Object.entries(object).reduce((acc, [key, value]) => ({ ...acc, [camelCase(key)]: value }), {});
}

export const sleep = (x: number) => new Promise((r) => setTimeout(r, x));
