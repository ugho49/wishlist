import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { IEventHandler } from '@nestjs/cqrs'
import { Job } from 'bullmq'

@Processor('events', {
  concurrency: 5,
})
export class EventsProcessor extends WorkerHost {
  private readonly logger = new Logger(EventsProcessor.name)
  private readonly eventHandlers = new Map<string, IEventHandler[]>()

  constructor(private readonly moduleRef: ModuleRef) {
    super()
  }

  async process(job: Job<{ eventName: string; payload: any }>): Promise<void> {
    const { eventName, payload } = job.data

    this.logger.debug(`Processing event: ${eventName}`)

    // Get all handlers for this event type
    const handlers = this.eventHandlers.get(eventName) || []

    if (handlers.length === 0) {
      this.logger.warn(`No handlers found for event: ${eventName}`)
      return
    }

    // Execute all handlers in parallel
    await Promise.all(
      handlers.map(async handler => {
        try {
          await handler.handle(payload)
          this.logger.debug(`Successfully handled event ${eventName} with ${handler.constructor.name}`)
        } catch (error) {
          this.logger.error(
            `Error handling event ${eventName} with ${handler.constructor.name}: ${error.message}`,
            error.stack,
          )
          throw error
        }
      }),
    )
  }

  registerHandler(eventName: string, handler: IEventHandler): void {
    const handlers = this.eventHandlers.get(eventName) || []
    handlers.push(handler)
    this.eventHandlers.set(eventName, handlers)
    this.logger.debug(`Registered handler ${handler.constructor.name} for event ${eventName}`)
  }
}
