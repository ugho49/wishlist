import { ForbiddenException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { ArrayContains } from 'typeorm'

import { SecretSantaUserEntity } from '../../infrastructure/secret-santa.entity'
import { SecretSantaRepository, SecretSantaUserRepository } from '../../infrastructure/secret-santa.repository'
import { DeleteSecretSantaUserCommand } from '../command/delete-secret-santa-user.command'

@CommandHandler(DeleteSecretSantaUserCommand)
export class DeleteSecretSantaUserHandler implements IInferredCommandHandler<DeleteSecretSantaUserCommand> {
  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async execute(command: DeleteSecretSantaUserCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    await this.secretSantaUserRepository.transaction(async em => {
      await em.delete(SecretSantaUserEntity, { id: command.secretSantaUserId })
      await em.update(
        SecretSantaUserEntity,
        { exclusions: ArrayContains([command.secretSantaUserId]) },
        { exclusions: () => `array_remove(exclusions, '${command.secretSantaUserId}')` },
      )
    })
  }
}
