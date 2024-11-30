import { ForbiddenException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { SecretSantaRepository } from '../../infrastructure/secret-santa.repository'
import { DeleteSecretSantaCommand } from '../command/delete-secret-santa.command'

@CommandHandler(DeleteSecretSantaCommand)
export class DeleteSecretSantaHandler implements IInferredCommandHandler<DeleteSecretSantaCommand> {
  constructor(private readonly secretSantaRepository: SecretSantaRepository) {}

  async execute(command: DeleteSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaRepository.delete({ id: secretSanta.id })
  }
}
