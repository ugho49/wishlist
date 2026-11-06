import type { AttendeeId, SecretSantaId, SecretSantaUserId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { SecretSantaUser } from '../../src/secret-santa/domain/model/secret-santa-user.model';

type SecretSantaUserBuilderData = {
  attendeeId: AttendeeId;
  secretSantaId: SecretSantaId;
  drawUserId?: SecretSantaUserId;
  revealed: boolean;
  exclusions: SecretSantaUserId[];
};

export class SecretSantaUserBuilder {
  private readonly data: SecretSantaUserBuilderData = {
    attendeeId: uuid() as AttendeeId,
    secretSantaId: uuid() as SecretSantaId,
    revealed: false,
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

  withDraw(drawUserId: SecretSantaUserId): this {
    this.data.drawUserId = drawUserId;
    return this;
  }

  revealed(): this {
    this.data.revealed = true;
    return this;
  }

  build(): SecretSantaUser {
    let user = SecretSantaUser.create({
      id: uuid() as SecretSantaUserId,
      attendeeId: this.data.attendeeId,
      secretSantaId: this.data.secretSantaId,
    }).updateExclusions(this.data.exclusions);

    if (this.data.drawUserId) {
      user = user.assignDraw(this.data.drawUserId);
    }

    if (this.data.revealed) {
      user = user.revealDraw();
    }

    return user;
  }
}
