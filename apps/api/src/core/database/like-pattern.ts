/**
 * Escapes the LIKE / ILIKE wildcards (`%`, `_`) and the escape character itself (`\`, the default
 * escape of Postgres), so that user input only ever matches literally.
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, character => `\\${character}`);
}

/** A LIKE / ILIKE pattern matching any value that contains `value` literally. */
export function containsPattern(value: string): string {
  return `%${escapeLike(value)}%`;
}
