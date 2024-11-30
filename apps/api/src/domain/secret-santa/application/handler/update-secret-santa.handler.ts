import { ForbiddenException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'

import { SecretSantaRepository } from '../../infrastructure/secret-santa.repository'
import { UpdateSecretSantaCommand } from '../command/update-secret-santa.command'

@CommandHandler(UpdateSecretSantaCommand)
export class UpdateSecretSantaHandler implements IInferredCommandHandler<UpdateSecretSantaCommand> {
  constructor(private readonly secretSantaRepository: SecretSantaRepository) {}

  async execute(command: UpdateSecretSantaCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaRepository.update(
      { id: secretSanta.id },
      {
        description: command.description ?? null,
        budget: command.budget ?? null,
      },
    )
  }
}
