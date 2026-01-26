import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { SecretSantaId } from '@wishlist/common'

import { SecretSantaUser } from '../../domain/model/secret-santa-user.model'
import { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository'

export type GetSecretSantaUsersBySecretSantasInput = {
  secretSantaIds: SecretSantaId[]
}

export type GetSecretSantaUsersBySecretSantasResult = Map<SecretSantaId, SecretSantaUser[]>

@Injectable()
export class GetSecretSantaUsersBySecretSantasUseCase {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async execute(input: GetSecretSantaUsersBySecretSantasInput): Promise<GetSecretSantaUsersBySecretSantasResult> {
    const secretSantaUsers = await this.secretSantaUserRepository.findBySecretSantaIds(input.secretSantaIds)
    return secretSantaUsers.reduce((acc, user) => {
      if (!acc.has(user.secretSantaId)) {
        acc.set(user.secretSantaId, [])
      }
      acc.get(user.secretSantaId)?.push(user)
      return acc
    }, new Map<SecretSantaId, SecretSantaUser[]>())
  }
}
