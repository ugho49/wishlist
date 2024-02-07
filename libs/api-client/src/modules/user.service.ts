import {
  type ChangeUserPasswordInputDto,
  type MiniUserDto,
  type RegisterUserInputDto,
  type RegisterUserWithGoogleInputDto,
  type ResetPasswordInputDto,
  type ResetPasswordValidationInputDto,
  type UpdateUserEmailSettingsInputDto,
  type UpdateUserPictureOutputDto,
  type UpdateUserProfileInputDto,
  type UserDto,
  type UserEmailSettingsDto,
} from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class UserService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  getInfo(): Promise<UserDto> {
    return this.getClient()
      .get(`/user`)
      .then((res) => res.data);
  }

  register(data: RegisterUserInputDto): Promise<MiniUserDto> {
    return this.getClient()
      .post(`/user/register`, data)
      .then((res) => res.data);
  }

  registerWithGoogle(data: RegisterUserWithGoogleInputDto): Promise<MiniUserDto> {
    return this.getClient()
      .post(`/user/register/google`, data)
      .then((res) => res.data);
  }

  async update(data: UpdateUserProfileInputDto): Promise<void> {
    await this.getClient()
      .put(`/user`, data)
      .then((res) => res.data);
  }

  async changePassword(data: ChangeUserPasswordInputDto): Promise<void> {
    await this.getClient()
      .put(`/user/change-password`, data)
      .then((res) => res.data);
  }

  searchUserByKeyword(keyword: string): Promise<MiniUserDto[]> {
    return this.getClient()
      .get(`/user/search`, { params: { keyword } })
      .then((res) => res.data);
  }

  async sendResetUserPasswordEmail(data: ResetPasswordInputDto): Promise<void> {
    await this.getClient()
      .post(`/user/forgot-password/send-reset-email`, data)
      .then((res) => res.data);
  }

  async validateResetPassword(data: ResetPasswordValidationInputDto): Promise<void> {
    await this.getClient()
      .post(`/user/forgot-password/reset`, data)
      .then((res) => res.data);
  }

  getEmailSettings(): Promise<UserEmailSettingsDto> {
    return this.getClient()
      .get('/user/email-settings')
      .then((res) => res.data);
  }

  updateUserEmailSettings(data: UpdateUserEmailSettingsInputDto): Promise<UserEmailSettingsDto> {
    return this.getClient()
      .put('/user/email-settings', data)
      .then((res) => res.data);
  }

  uploadPicture(file: File): Promise<UpdateUserPictureOutputDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.getClient()
      .post('/user/upload-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data);
  }

  async updatePictureFromSocial(socialId: string): Promise<void> {
    await this.getClient()
      .put(`/user/picture`, {}, { params: { social_id: socialId } })
      .then((res) => res.data);
  }

  async deletePicture(): Promise<void> {
    await this.getClient()
      .delete(`/user/picture`)
      .then((res) => res.data);
  }
}
