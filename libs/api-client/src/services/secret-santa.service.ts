import type {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUsersInputDto,
  CreateSecretSantaUsersOutputDto,
  EventId,
  SecretSantaDto,
  SecretSantaId,
  SecretSantaUserId,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class SecretSantaService {
  constructor(private readonly client: AxiosInstance) {}

  getMyDraw(eventId: EventId, options?: CommonRequestOptions): Promise<AttendeeDto | undefined> {
    return this.client
      .get('/secret-santa/user/draw', { params: { eventId }, signal: options?.signal })
      .then(res => res.data)
  }

  get(eventId: EventId, options?: CommonRequestOptions): Promise<SecretSantaDto | undefined> {
    return this.client.get('/secret-santa', { params: { eventId }, signal: options?.signal }).then(res => res.data)
  }

  create(data: CreateSecretSantaInputDto): Promise<SecretSantaDto> {
    return this.client.post('/secret-santa', data).then(res => res.data)
  }

  async update(secretSantaId: SecretSantaId, data: UpdateSecretSantaInputDto): Promise<void> {
    await this.client.patch(`/secret-santa/${secretSantaId}`, data)
  }

  async start(secretSantaId: SecretSantaId): Promise<void> {
    await this.client.post(`/secret-santa/${secretSantaId}/start`, {})
  }

  async cancel(secretSantaId: SecretSantaId): Promise<void> {
    await this.client.post(`/secret-santa/${secretSantaId}/cancel`, {})
  }

  async delete(secretSantaId: SecretSantaId): Promise<void> {
    await this.client.delete(`/secret-santa/${secretSantaId}`)
  }

  addUsers(
    secretSantaId: SecretSantaId,
    data: CreateSecretSantaUsersInputDto,
  ): Promise<CreateSecretSantaUsersOutputDto> {
    return this.client.post(`/secret-santa/${secretSantaId}/users`, data).then(res => res.data)
  }

  async updateUser(
    secretSantaId: SecretSantaId,
    secretSantaUserId: SecretSantaUserId,
    data: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    await this.client.put(`/secret-santa/${secretSantaId}/user/${secretSantaUserId}`, data)
  }

  async deleteUser(secretSantaId: SecretSantaId, secretSantaUserId: SecretSantaUserId): Promise<void> {
    await this.client.delete(`/secret-santa/${secretSantaId}/user/${secretSantaUserId}`)
  }
}
