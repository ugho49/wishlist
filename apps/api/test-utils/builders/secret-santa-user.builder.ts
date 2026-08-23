import type { AttendeeId, SecretSantaId, SecretSantaUserId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { SecretSantaUser } from '../../src/secret-santa/domain/model/secret-santa-user.model';

type SecretSantaUserBuilderData = {
  attendeeId: AttendeeId;
  secretSantaId: SecretSantaId;
  exclusions: SecretSantaUserId[];
};

export class SecretSantaUserBuilder {
  private readonly data: SecretSantaUserBuilderData = {
    attendeeId: uuid() as AttendeeId,
    secretSantaId: uuid() as SecretSantaId,
    exclusions: [],
  };

  withAttendeeId(attendeeId: AttendeeId): this {
    this.data.attendeeId = attendeeId;
    return this;
  }

  withSecretSantaId(secretSantaId: SecretSantaId): this {
    this.data.secretSantaId = secretSantaId;
    return this;
  }

  withExclusions(exclusions: SecretSantaUserId[]): this {
    this.data.exclusions = exclusions;
    return this;
  }

  build(): SecretSantaUser {
    return SecretSantaUser.create({
      id: uuid() as SecretSantaUserId,
      attendeeId: this.data.attendeeId,
      secretSantaId: this.data.secretSantaId,
    }).updateExclusions(this.data.exclusions);
  }
}
