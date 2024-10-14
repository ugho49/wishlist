import {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUsersInputDto,
  CreateSecretSantaUsersOutputDto,
  SecretSantaDto,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common-types'
import { AxiosInstance } from 'axios'

import { CommonRequestOptions } from './common'

export class SecretSantaService {
  constructor(private readonly client: AxiosInstance) {}

  getMyDraw(eventId: string, options?: CommonRequestOptions): Promise<AttendeeDto | null> {
    return this.client
      .get(`/secret-santa/user/draw`, { params: { eventId }, signal: options?.signal })
      .then(res => res.data)
  }

  get(eventId: string, options?: CommonRequestOptions): Promise<SecretSantaDto | null> {
    return this.client.get(`/secret-santa`, { params: { eventId }, signal: options?.signal }).then(res => res.data)
  }

  create(data: CreateSecretSantaInputDto): Promise<SecretSantaDto> {
    return this.client.post(`/secret-santa`, data).then(res => res.data)
  }

  async update(secretSantaId: string, data: UpdateSecretSantaInputDto): Promise<void> {
    await this.client.patch(`/secret-santa/${secretSantaId}`, data)
  }

  async start(secretSantaId: string): Promise<void> {
    await this.client.post(`/secret-santa/${secretSantaId}/start`, {})
  }

  async cancel(secretSantaId: string): Promise<void> {
    await this.client.post(`/secret-santa/${secretSantaId}/cancel`, {})
  }

  async delete(secretSantaId: string): Promise<void> {
    await this.client.delete(`/secret-santa/${secretSantaId}`)
  }

  addUsers(secretSantaId: string, data: CreateSecretSantaUsersInputDto): Promise<CreateSecretSantaUsersOutputDto> {
    return this.client.post(`/secret-santa/${secretSantaId}/users`, data).then(res => res.data)
  }

  async updateUser(
    secretSantaId: string,
    secretSantaUserId: string,
    data: UpdateSecretSantaUserInputDto,
  ): Promise<void> {
    await this.client.put(`/secret-santa/${secretSantaId}/user/${secretSantaUserId}`, data)
  }

  async deleteUser(secretSantaId: string, secretSantaUserId: string): Promise<void> {
    await this.client.delete(`/secret-santa/${secretSantaId}/user/${secretSantaUserId}`)
  }
}
