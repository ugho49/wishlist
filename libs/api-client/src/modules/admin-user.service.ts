import {
  type GetAllUsersQueryDto,
  type PagedResponse,
  type UpdateFullUserProfileInputDto,
  type UpdateUserPictureOutputDto,
  type UserDto,
} from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class AdminUserService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  getById(userId: string): Promise<UserDto> {
    return this.getClient()
      .get(`/admin/user/${userId}`)
      .then((res) => res.data);
  }

  getAll(params: GetAllUsersQueryDto): Promise<PagedResponse<UserDto>> {
    return this.getClient()
      .get(`/admin/user`, { params })
      .then((res) => res.data);
  }

  async update(userId: string, data: UpdateFullUserProfileInputDto): Promise<void> {
    await this.getClient()
      .patch(`/admin/user/${userId}`, data)
      .then((res) => res.data);
  }

  async delete(userId: string): Promise<void> {
    await this.getClient()
      .delete(`/admin/user/${userId}`)
      .then((res) => res.data);
  }

  async uploadPicture(userId: string, file: File): Promise<UpdateUserPictureOutputDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.getClient()
      .post(`/admin/user/${userId}/upload-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  }

  async deletePicture(userId: string): Promise<void> {
    await this.getClient()
      .delete(`/admin/user/${userId}/picture`)
      .then((res) => res.data);
  }
}
