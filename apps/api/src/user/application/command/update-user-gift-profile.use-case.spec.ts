import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UpdateUserGiftProfileUseCase } from './update-user-gift-profile.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserGiftProfileUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: UpdateUserGiftProfileUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    user = new UserBuilder().withEmail('marie@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(user);
    useCase = new UpdateUserGiftProfileUseCase(userRepository);
  });

  it('should persist sizes, notes and address', async () => {
    const { profile } = await useCase.execute({
      userId: user.id,
      profile: {
        clothingSize: 'M',
        shoeSize: '42',
        notes: 'Allergie au latex',
        address: {
          line1: '12 rue des Fleurs',
          postalCode: '75011',
          city: 'Paris',
          country: 'France',
        },
      },
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(profile).toEqual({
      clothingSize: 'M',
      shoeSize: '42',
      notes: 'Allergie au latex',
      address: {
        line1: '12 rue des Fleurs',
        line2: undefined,
        postalCode: '75011',
        city: 'Paris',
        country: 'France',
      },
    });
  });

  it('should treat blank strings as cleared fields', async () => {
    const { profile } = await useCase.execute({
      userId: user.id,
      profile: {
        clothingSize: '  ',
        notes: '',
      },
    });

    expect(profile.clothingSize).toBeUndefined();
    expect(profile.notes).toBeUndefined();
    expect(profile.address).toBeUndefined();
  });
});
