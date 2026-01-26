import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { SecretSantaUserId } from '@wishlist/common'

import { SecretSantaUser } from '../../domain/model/secret-santa-user.model'
import { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository'

export type GetSecretSantaUsersByIdsInput = {
  secretSantaUserIds: SecretSantaUserId[]
}

@Injectable()
export class GetSecretSantaUsersByIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  execute(input: GetSecretSantaUsersByIdsInput): Promise<SecretSantaUser[]> {
    return this.secretSantaUserRepository.findByIds(input.secretSantaUserIds)
  }
}
