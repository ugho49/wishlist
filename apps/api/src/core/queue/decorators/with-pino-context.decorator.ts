import { PinoLogger } from 'pino-nestjs'
import { Store, storage } from 'pino-nestjs/dist/storage'

/**
 * Decorator that wraps BullMQ processor methods with Pino async context storage.
 * This allows using PinoLogger.assign() within job processors without getting
 * "unable to assign extra fields out of request scope" errors.
 *
 * @example
 * ```typescript
 * @Processor(QueueName.MAILS)
 * export class MailProcessor extends WorkerHost {
 *   @WithPinoContext()
 *   async process(job: Job<MailPayload>): Promise<void> {
 *     this.pinoLogger.assign({ jobId: job.id })
 *     // ... rest of processing
 *   }
 * }
 * ```
 */
export function WithPinoContext(): MethodDecorator {
  return (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: unknown[]) {
      // Create a new Pino logger context for this job execution
      return storage.run(new Store(PinoLogger.root.child({})), async () => {
        return await originalMethod.apply(this, args)
      })
    }

    return descriptor
  }
}
