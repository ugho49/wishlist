import type {
  GetAllUsersQueryDto,
  PagedResponse,
  UpdateFullUserProfileInputDto,
  UpdateUserPictureOutputDto,
  UserDto,
  UserId,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'

import type { CommonRequestOptions } from './common'

export class AdminUserService {
  constructor(private readonly client: AxiosInstance) {}

  getById(userId: UserId, options?: CommonRequestOptions): Promise<UserDto> {
    return this.client.get(`/admin/user/${userId}`, { signal: options?.signal }).then(res => res.data)
  }

  getAll(params: GetAllUsersQueryDto, options?: CommonRequestOptions): Promise<PagedResponse<UserDto>> {
    return this.client.get(`/admin/user`, { params, signal: options?.signal }).then(res => res.data)
  }

  async update(userId: UserId, data: UpdateFullUserProfileInputDto): Promise<void> {
    await this.client.patch(`/admin/user/${userId}`, data)
  }

  async delete(userId: UserId): Promise<void> {
    await this.client.delete(`/admin/user/${userId}`)
  }

  async uploadPicture(userId: UserId, file: File): Promise<UpdateUserPictureOutputDto> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client
      .post(`/admin/user/${userId}/upload-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data)
  }

  async deletePicture(userId: UserId): Promise<void> {
    await this.client.delete(`/admin/user/${userId}/picture`)
  }
}
