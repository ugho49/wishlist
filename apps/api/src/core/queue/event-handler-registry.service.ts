import { Injectable, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import { EVENTS_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants'
import { IEventHandler } from '@nestjs/cqrs'

import { EventsProcessor } from './events.processor'

@Injectable()
export class EventHandlerRegistryService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly eventsProcessor: EventsProcessor,
  ) {}

  onModuleInit() {
    this.registerEventHandlers()
  }

  private registerEventHandlers(): void {
    const providers = this.discoveryService.getProviders()

    providers.forEach(wrapper => {
      const { instance } = wrapper

      if (!instance || typeof instance === 'string') {
        return
      }

      const prototype = Object.getPrototypeOf(instance)
      const isEventHandler = this.reflector.get(EVENTS_HANDLER_METADATA, instance.constructor)

      if (isEventHandler) {
        const handler = instance as IEventHandler
        const eventName = isEventHandler.name

        this.eventsProcessor.registerHandler(eventName, handler)
      }
    })
  }
}
