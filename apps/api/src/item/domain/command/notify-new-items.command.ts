import { Command } from '@nestjs-architects/typed-cqrs'

export class NotifyNewItemsCommand extends Command<void> {
  constructor() {
    super()
  }
}
