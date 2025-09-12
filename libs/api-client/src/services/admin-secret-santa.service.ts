import type { SecretSantaDto } from '@wishlist/common'
import type { AxiosInstance } from 'axios'

import type { CommonRequestOptions } from './common'

export class AdminSecretSantaService {
  constructor(private readonly client: AxiosInstance) {}

  get(eventId: string, options?: CommonRequestOptions): Promise<SecretSantaDto | null> {
    return this.client
      .get(`/admin/secret-santa`, { params: { eventId }, signal: options?.signal })
      .then(res => res.data)
  }

  async start(secretSantaId: string): Promise<void> {
    await this.client.post(`/admin/secret-santa/${secretSantaId}/start`, {})
  }

  async cancel(secretSantaId: string): Promise<void> {
    await this.client.post(`/admin/secret-santa/${secretSantaId}/cancel`, {})
  }

  async delete(secretSantaId: string): Promise<void> {
    await this.client.delete(`/admin/secret-santa/${secretSantaId}`)
  }
}
