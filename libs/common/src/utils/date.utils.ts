/**
 * Parses an ISO 8601 date string into a Date object
 * @param dateString - ISO 8601 formatted date string
 * @returns Date object
 */
export function parseISO(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Formats a Date object to ISO 8601 string
 * @param date - Date object to format
 * @returns ISO 8601 formatted string
 */
export function formatISO(date: Date): string {
  return date.toISOString()
}

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object to format
 * @returns ISO date string
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

/**
 * Adds minutes to a date
 * @param date - Date object to add minutes to
 * @param minutes - Number of minutes to add
 * @returns New Date object with minutes added
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

/**
 * Adds days to a date
 * @param date - Date object to add days to
 * @param days - Number of days to add
 * @returns New Date object with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Subtracts days from a date
 * @param date - Date object to subtract days from
 * @param days - Number of days to subtract
 * @returns New Date object with days subtracted
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Adds hours to a date
 * @param date - Date object to add hours to
 * @param hours - Number of hours to add
 * @returns New Date object with hours added
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

/**
 * Subtracts hours from a date
 * @param date - Date object to subtract hours from
 * @param hours - Number of hours to subtract
 * @returns New Date object with hours subtracted
 */
export function subtractHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() - hours)
  return result
}

/**
 * Adds months to a date
 * @param date - Date object to add months to
 * @param months - Number of months to add
 * @returns New Date object with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Subtracts months from a date
 * @param date - Date object to subtract months from
 * @param months - Number of months to subtract
 * @returns New Date object with months subtracted
 */
export function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

/**
 * Adds years to a date
 * @param date - Date object to add years to
 * @param years - Number of years to add
 * @returns New Date object with years added
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * Subtracts years from a date
 * @param date - Date object to subtract years from
 * @param years - Number of years to subtract
 * @returns New Date object with years subtracted
 */
export function subtractYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() - years)
  return result
}
