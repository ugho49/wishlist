import type { UserGiftProfile, UserShippingAddress } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type UpdateUserGiftProfileInput = {
  userId: UserId;
  profile: {
    clothingSize?: string;
    shoeSize?: string;
    notes?: string;
    address?: UserShippingAddress;
  };
};

export type UpdateUserGiftProfileOutput = {
  profile: UserGiftProfile;
};

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

@Injectable()
export class UpdateUserGiftProfileUseCase {
  constructor(@Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserGiftProfileInput): Promise<UpdateUserGiftProfileOutput> {
    const user = await this.userRepository.findByIdOrFail(input.userId);
    const address = input.profile.address
      ? {
          line1: input.profile.address.line1.trim(),
          line2: emptyToUndefined(input.profile.address.line2),
          postalCode: input.profile.address.postalCode.trim(),
          city: input.profile.address.city.trim(),
          country: input.profile.address.country.trim(),
        }
      : undefined;

    const updated = user.updateGiftProfile({
      clothingSize: emptyToUndefined(input.profile.clothingSize),
      shoeSize: emptyToUndefined(input.profile.shoeSize),
      notes: emptyToUndefined(input.profile.notes),
      address,
    });

    await this.userRepository.save(updated);
    return { profile: updated.getGiftProfile() };
  }
}
