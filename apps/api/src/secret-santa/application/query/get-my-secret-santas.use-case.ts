import type { SecretSanta } from '../../domain/model/secret-santa.model';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';

export type GetMySecretSantasInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
};

export type GetMySecretSantasOutput = {
  secretSantas: SecretSanta[];
  totalCount: number;
};

@Injectable()
export class GetMySecretSantasUseCase {
  constructor(private readonly secretSantaRepository: SecretSantaRepository) {}

  async execute(input: GetMySecretSantasInput): Promise<GetMySecretSantasOutput> {
    const skip = (input.pageNumber - 1) * input.pageSize;

    const { secretSantas, totalCount } = await this.secretSantaRepository.findVisibleForUserPaginated({
      userId: input.userId,
      pagination: { take: input.pageSize, skip },
    });

    return { secretSantas, totalCount };
  }
}
