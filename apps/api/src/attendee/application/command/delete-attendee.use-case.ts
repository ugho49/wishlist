import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { DeleteAttendeeCommand } from '../../domain'
import { LegacyAttendeeService } from '../../infrastructure/legacy-attendee.service'

@CommandHandler(DeleteAttendeeCommand)
export class DeleteAttendeeUseCase implements IInferredCommandHandler<DeleteAttendeeCommand> {
  constructor(private readonly legacyAttendeeService: LegacyAttendeeService) {}

  async execute(command: DeleteAttendeeCommand) {
    await this.legacyAttendeeService.deleteAttendee({
      currentUser: command.currentUser,
      attendeeId: command.attendeeId,
    })
  }
}
