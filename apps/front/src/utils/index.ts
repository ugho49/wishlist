export const sleep = (x: number) => new Promise((r) => setTimeout(r, x));

export function isBlank(str: string | undefined | null) {
  return !str || /^\s*$/.test(str);
}
