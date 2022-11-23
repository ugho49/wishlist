import { v4 } from 'uuid';

export const randomString = (length: number) =>
  [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('');

export const uuid = () => v4();
