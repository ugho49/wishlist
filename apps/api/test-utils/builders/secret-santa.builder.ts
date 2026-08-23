import type { EventId, SecretSantaId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { SecretSanta } from '../../src/secret-santa/domain/model/secret-santa.model';
import { SecretSantaUser } from '../../src/secret-santa/domain/model/secret-santa-user.model';
import { SecretSantaStatus } from '../../src/secret-santa/domain/secret-santa-status.enum';

type SecretSantaBuilderData = {
  eventId: EventId;
  description?: string;
  budget?: number;
  status: SecretSantaStatus;
  users: SecretSantaUser[];
};

export class SecretSantaBuilder {
  private readonly data: SecretSantaBuilderData = {
    eventId: uuid() as EventId,
    status: SecretSantaStatus.CREATED,
    users: [],
  };

  withEventId(eventId: EventId): this {
    this.data.eventId = eventId;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  withBudget(budget: number): this {
    this.data.budget = budget;
    return this;
  }

  withUsers(users: SecretSantaUser[]): this {
    this.data.users = users;
    return this;
  }

  started(): this {
    this.data.status = SecretSantaStatus.STARTED;
    return this;
  }

  build(): SecretSanta {
    const now = new Date();
    const created = SecretSanta.create({
      id: uuid() as SecretSantaId,
      description: this.data.description,
      budget: this.data.budget,
      eventId: this.data.eventId,
    });

    return new SecretSanta({
      ...created,
      status: this.data.status,
      users: this.data.users,
      createdAt: now,
      updatedAt: now,
    });
  }
}
