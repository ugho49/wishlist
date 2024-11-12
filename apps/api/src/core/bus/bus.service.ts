import type { QueryHandlerRegistry } from './registry/query.registry'

import { Injectable, Logger } from '@nestjs/common'
import {
  createCommandBus,
  createLoggerMiddleware,
  createQueryBus,
  Envelope,
  CommandBus as MissiveCommandBus,
  QueryBus as MissiveQueryBus,
} from 'missive.js'

import { CommandHandlerRegistry } from './registry/command.registry'

type MessageHandler<Intent, Result> = (envelope: Envelope<Intent>) => Promise<Result>

type QueryHandler<MessageName extends keyof QueryHandlerRegistry> = MessageHandler<
  QueryHandlerRegistry[MessageName]['query'],
  QueryHandlerRegistry[MessageName]['result']
>

type CommandHandler<MessageName extends keyof CommandHandlerRegistry> = MessageHandler<
  CommandHandlerRegistry[MessageName]['command'],
  CommandHandlerRegistry[MessageName]['result']
>

@Injectable()
export class BusService {
  private readonly logger = new Logger(BusService.name)

  private readonly queryBus: MissiveQueryBus<QueryHandlerRegistry>
  private readonly commandBus: MissiveCommandBus<CommandHandlerRegistry>

  private readonly registeredQueryHandlers: Set<keyof QueryHandlerRegistry> = new Set()
  private readonly registeredCommandHandlers: Set<keyof CommandHandlerRegistry> = new Set()

  constructor() {
    this.queryBus = createQueryBus<QueryHandlerRegistry>({
      middlewares: [createLoggerMiddleware({ logger: new Logger('QueryBus') })],
    })
    this.commandBus = createCommandBus<CommandHandlerRegistry>({
      middlewares: [createLoggerMiddleware({ logger: new Logger('CommandBus') })],
    })
  }

  registerQueryHandler<MessageName extends keyof QueryHandlerRegistry>(
    type: MessageName,
    handler: QueryHandler<MessageName>,
  ) {
    if (this.registeredQueryHandlers.has(type)) {
      throw new Error(`Query handler for ${type} is already registered`)
    }
    this.registeredQueryHandlers.add(type)
    this.logger.log(`Registering query handler for ${type}`)
    this.queryBus.register(type, handler)
  }

  registerCommandHandler<MessageName extends keyof CommandHandlerRegistry>(
    type: MessageName,
    handler: CommandHandler<MessageName>,
  ) {
    if (this.registeredCommandHandlers.has(type)) {
      throw new Error(`Command handler for ${type} is already registered`)
    }
    this.registeredCommandHandlers.add(type)
    this.logger.log(`Registering command handler for ${type}`)
    this.commandBus.register(type, handler)
  }

  async dispatchQuery<MessageName extends keyof QueryHandlerRegistry>(
    type: MessageName,
    intent: QueryHandlerRegistry[MessageName]['query'],
  ): Promise<QueryHandlerRegistry[MessageName]['result'] | undefined> {
    const query = this.queryBus.createQuery(type, intent)
    const { result } = await this.queryBus.dispatch(query)
    return result
  }

  async dispatchCommand<MessageName extends keyof CommandHandlerRegistry>(
    type: MessageName,
    intent: CommandHandlerRegistry[MessageName]['command'],
  ): Promise<CommandHandlerRegistry[MessageName]['result'] | undefined> {
    const command = this.commandBus.createCommand(type, intent)
    const { result } = await this.commandBus.dispatch(command)
    return result
  }
}
