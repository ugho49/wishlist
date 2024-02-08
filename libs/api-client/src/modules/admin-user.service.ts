import {
  type GetAllUsersQueryDto,
  type PagedResponse,
  type UpdateFullUserProfileInputDto,
  type UpdateUserPictureOutputDto,
  type UserDto,
} from '@wishlist/common-types';
import { AxiosInstance } from 'axios';

export class AdminUserService {
  constructor(private readonly client: AxiosInstance) {}

  getById(userId: string): Promise<UserDto> {
    return this.client.get(`/admin/user/${userId}`).then((res) => res.data);
  }

  getAll(params: GetAllUsersQueryDto): Promise<PagedResponse<UserDto>> {
    return this.client.get(`/admin/user`, { params }).then((res) => res.data);
  }

  async update(userId: string, data: UpdateFullUserProfileInputDto): Promise<void> {
    await this.client.patch(`/admin/user/${userId}`, data).then((res) => res.data);
  }

  async delete(userId: string): Promise<void> {
    await this.client.delete(`/admin/user/${userId}`).then((res) => res.data);
  }

  async uploadPicture(userId: string, file: File): Promise<UpdateUserPictureOutputDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client
      .post(`/admin/user/${userId}/upload-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  }

  async deletePicture(userId: string): Promise<void> {
    await this.client.delete(`/admin/user/${userId}/picture`).then((res) => res.data);
  }
}
