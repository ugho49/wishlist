import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { In } from 'typeorm'

import { SecretSantaRepository, SecretSantaUserRepository } from '../../infrastructure/secret-santa.repository'
import { UpdateSecretSantaUserCommand } from '../command/update-secret-santa-user.command'

@CommandHandler(UpdateSecretSantaUserCommand)
export class UpdateSecretSantaUserHandler implements IInferredCommandHandler<UpdateSecretSantaUserCommand> {
  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async execute(command: UpdateSecretSantaUserCommand): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: command.secretSantaId,
      userId: command.userId,
    })

    if (secretSanta.isStarted()) {
      throw new ForbiddenException('Secret santa already started')
    }

    const secretSantaUsers =
      command.exclusions.length === 0
        ? []
        : await this.secretSantaUserRepository.findBy({
            id: In(command.exclusions),
            secretSantaId: command.secretSantaId,
          })

    const exclusionsIds = secretSantaUsers.map(u => u.id)

    if (exclusionsIds.includes(command.secretSantaUserId)) {
      throw new BadRequestException('Secret santa user cannot exclude himself')
    }

    await this.secretSantaUserRepository.update(
      { id: command.secretSantaUserId },
      {
        exclusions: exclusionsIds,
      },
    )
  }
}
