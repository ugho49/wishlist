import { ForbiddenException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { SECRET_SANTA_REPOSITORY } from '../../../repositories/repositories.tokens'
import { DeleteSecretSantaCommand } from '../../domain/command/delete-secret-santa.command'
import { SecretSantaRepository } from '../../domain/repository/secret-santa.repository'

@CommandHandler(DeleteSecretSantaCommand)
export class DeleteSecretSantaHandler implements IInferredCommandHandler<DeleteSecretSantaCommand> {
  constructor(@Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository) {}

  async execute(command: DeleteSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaRepository.delete(secretSanta.id)
  }
}
