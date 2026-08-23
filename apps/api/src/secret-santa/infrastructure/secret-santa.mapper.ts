import type { SecretSanta } from '../domain/model/secret-santa.model';
import type { SecretSantaUser } from '../domain/model/secret-santa-user.model';

import { SecretSantaStatus } from '@wishlist/common';
import { match } from 'ts-pattern';

import {
  type SecretSanta as GqlSecretSanta,
  SecretSantaStatus as GqlSecretSantaStatus,
  type SecretSantaUser as GqlSecretSantaUser,
} from '../../gql/generated-types';

function toGqlSecretSantaStatus(status: SecretSantaStatus): GqlSecretSantaStatus {
  return match(status)
    .with(SecretSantaStatus.CREATED, () => GqlSecretSantaStatus.Created)
    .with(SecretSantaStatus.STARTED, () => GqlSecretSantaStatus.Started)
    .exhaustive();
}

function toGqlSecretSantaUser(user: SecretSantaUser): GqlSecretSantaUser {
  return {
    __typename: 'SecretSantaUser',
    id: user.id,
    attendeeId: user.attendeeId,
    exclusions: user.exclusions,
  };
}

function toGqlSecretSanta(secretSanta: SecretSanta): GqlSecretSanta {
  return {
    __typename: 'SecretSanta',
    id: secretSanta.id,
    eventId: secretSanta.eventId,
    description: secretSanta.description,
    budget: secretSanta.budget,
    status: toGqlSecretSantaStatus(secretSanta.status),
    users: secretSanta.users.map(toGqlSecretSantaUser),
    createdAt: secretSanta.createdAt.toISOString(),
    updatedAt: secretSanta.updatedAt.toISOString(),
  };
}

export const secretSantaMapper = {
  toGqlSecretSanta,
  toGqlSecretSantaUser,
};
