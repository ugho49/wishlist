import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { Queue } from 'bullmq'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class EventPublisherService implements OnModuleInit {
  private readonly logger = new Logger(EventPublisherService.name)
  private readonly subject$ = new Subject<any>()

  constructor(
    private readonly eventBus: EventBus,
    @InjectQueue('events') private readonly eventsQueue: Queue,
  ) {}

  onModuleInit() {
    // Subscribe to all events from the event bus
    this.eventBus.subscribe(event => {
      this.publishToQueue(event).catch(error => {
        this.logger.error(`Failed to publish event to queue: ${error.message}`, error.stack)
      })
    })
  }

  private async publishToQueue(event: any): Promise<void> {
    const eventName = event.constructor.name

    this.logger.debug(`Publishing event to queue: ${eventName}`)

    await this.eventsQueue.add(
      eventName,
      {
        eventName,
        payload: event,
      },
      {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    )
  }

  publish<T>(event: T): Observable<T> {
    this.subject$.next(event)
    return this.subject$.asObservable()
  }
}
