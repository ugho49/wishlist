import type { Response } from 'express'

/**
 * Will allow to add context in logs and spans (like `companyId`, `absoluteMonth`, etc.)
 */
export class Observability {
  /**
   * Constructor
   * @param response The express response object, so it can be reused by nestjs-logger
   */
  constructor(private readonly response: Response) {}

  /**
   * Will append the provided context to the response so it can be reused by
   * nestjs-logger, and to the current span
   * @param context The context to add
   */
  setContext(context: Record<string, unknown>): void {
    this.response.locals = {
      ...this.response.locals,
      ...context,
    }
  }
}
