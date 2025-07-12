import type { SecretSantaDto, SecretSantaUserDto, SecretSantaUserWithDrawDto } from '@wishlist/common'

import type { SecretSantaModel } from '../domain/model/secret-santa.model'
import type { SecretSantaUserModel } from '../domain/model/secret-santa-user.model'

// TODO: Ces mappers nécessitent maintenant des services pour récupérer les données relationnelles
// car les models domain ne contiennent pas les relations hydratées

export function toSecretSantaUserDto(model: SecretSantaUserModel): SecretSantaUserDto {
  return {
    id: model.id,
    // TODO: Récupérer l'attendee via un service
    attendee: {} as any,
    exclusions: model.exclusions,
  }
}

export function toSecretSantaUserWithDrawDto(model: SecretSantaUserModel): SecretSantaUserWithDrawDto {
  return {
    id: model.id,
    // TODO: Récupérer l'attendee et le draw via des services
    attendee: {} as any,
    exclusions: model.exclusions,
    draw: undefined,
  }
}

export function toSecretSantaDto(model: SecretSantaModel): SecretSantaDto {
  return {
    id: model.id,
    description: model.description,
    budget: model.budget,
    status: model.status,
    // TODO: Récupérer l'event via un service
    event: {} as any,
    users: model.users.map(toSecretSantaUserDto),
    created_at: model.createdAt.toISOString(),
    updated_at: model.updatedAt.toISOString(),
  }
}
