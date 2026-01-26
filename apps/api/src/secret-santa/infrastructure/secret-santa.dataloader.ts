import { Injectable } from '@nestjs/common'
import { SecretSantaId, SecretSantaUserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { SecretSantaUser } from '../../gql/generated-types'
import { GetSecretSantaUsersByIdsUseCase } from '../application/query/get-secret-santa-users-by-ids'
import { GetSecretSantaUsersBySecretSantasUseCase } from '../application/query/get-secret-santa-users-by-secret-santas.use-case'
import { secretSantaMapper } from './secret-santa.mapper'

@Injectable()
export class SecretSantaDataLoaderFactory {
  constructor(
    private readonly getSecretSantaUsersByIdsUseCase: GetSecretSantaUsersByIdsUseCase,
    private readonly getSecretSantaUsersBySecretSantasUseCase: GetSecretSantaUsersBySecretSantasUseCase,
  ) {}

  createSecretSantaUserLoader() {
    return new DataLoader<SecretSantaUserId, SecretSantaUser | null>(
      async (secretSantaUserIds: readonly SecretSantaUserId[]) => {
        const secretSantaUsers = await this.getSecretSantaUsersByIdsUseCase.execute({
          secretSantaUserIds: [...secretSantaUserIds],
        })

        const secretSantaMap = new Map(
          secretSantaUsers.map(secretSantaUser => [
            secretSantaUser.id,
            secretSantaMapper.toGqlSecretSantaUser(secretSantaUser),
          ]),
        )

        return secretSantaUserIds.map(id => secretSantaMap.get(id) ?? null)
      },
    )
  }

  createSecretSantaUsersBySecretSantaLoader() {
    return new DataLoader<SecretSantaId, SecretSantaUser[]>(async (secretSantaIds: readonly SecretSantaId[]) => {
      const secretSantaUsers = await this.getSecretSantaUsersBySecretSantasUseCase.execute({
        secretSantaIds: [...secretSantaIds],
      })

      return secretSantaIds.map(id =>
        (secretSantaUsers.get(id) ?? []).map(user => secretSantaMapper.toGqlSecretSantaUser(user)),
      )
    })
  }
}
