import type {
  EventId,
  SecretSantaDto,
  SecretSantaId,
  SecretSantaUserId,
  UpdateSecretSantaInputDto,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class AdminSecretSantaService {
  constructor(private readonly client: AxiosInstance) {}

  get(eventId: EventId, options?: CommonRequestOptions): Promise<SecretSantaDto | null> {
    return this.client
      .get('/admin/secret-santa', { params: { eventId }, signal: options?.signal })
      .then(res => res.data)
  }

  async update(secretSantaId: SecretSantaId, data: UpdateSecretSantaInputDto): Promise<void> {
    await this.client.patch(`/admin/secret-santa/${secretSantaId}`, data)
  }

  async start(secretSantaId: SecretSantaId): Promise<void> {
    await this.client.post(`/admin/secret-santa/${secretSantaId}/start`, {})
  }

  async cancel(secretSantaId: SecretSantaId): Promise<void> {
    await this.client.post(`/admin/secret-santa/${secretSantaId}/cancel`, {})
  }

  async delete(secretSantaId: SecretSantaId): Promise<void> {
    await this.client.delete(`/admin/secret-santa/${secretSantaId}`)
  }

  async deleteUser(secretSantaId: SecretSantaId, secretSantaUserId: SecretSantaUserId): Promise<void> {
    await this.client.delete(`/admin/secret-santa/${secretSantaId}/user/${secretSantaUserId}`)
  }
}
