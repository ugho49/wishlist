import type {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  RegisterUserWithGoogleInputDto,
  ResetPasswordInputDto,
  ResetPasswordValidationInputDto,
  UpdateUserEmailSettingsInputDto,
  UpdateUserPictureOutputDto,
  UpdateUserProfileInputDto,
  UserDto,
  UserEmailSettingsDto,
} from '@wishlist/common-types'

import { AxiosInstance } from 'axios'

import { CommonRequestOptions } from './common'

export class UserService {
  constructor(private readonly client: AxiosInstance) {}

  getInfo(options?: CommonRequestOptions): Promise<UserDto> {
    return this.client.get(`/user`, { signal: options?.signal }).then(res => res.data)
  }

  register(data: RegisterUserInputDto): Promise<MiniUserDto> {
    return this.client.post(`/user/register`, data).then(res => res.data)
  }

  registerWithGoogle(data: RegisterUserWithGoogleInputDto): Promise<MiniUserDto> {
    return this.client.post(`/user/register/google`, data).then(res => res.data)
  }

  async update(data: UpdateUserProfileInputDto): Promise<void> {
    await this.client.put(`/user`, data).then(res => res.data)
  }

  async changePassword(data: ChangeUserPasswordInputDto): Promise<void> {
    await this.client.put(`/user/change-password`, data).then(res => res.data)
  }

  searchUserByKeyword(keyword: string): Promise<MiniUserDto[]> {
    return this.client.get(`/user/search`, { params: { keyword } }).then(res => res.data)
  }

  async sendResetUserPasswordEmail(data: ResetPasswordInputDto): Promise<void> {
    await this.client.post(`/user/forgot-password/send-reset-email`, data).then(res => res.data)
  }

  async validateResetPassword(data: ResetPasswordValidationInputDto): Promise<void> {
    await this.client.post(`/user/forgot-password/reset`, data).then(res => res.data)
  }

  getEmailSettings(options?: CommonRequestOptions): Promise<UserEmailSettingsDto> {
    return this.client.get('/user/email-settings', { signal: options?.signal }).then(res => res.data)
  }

  updateUserEmailSettings(data: UpdateUserEmailSettingsInputDto): Promise<UserEmailSettingsDto> {
    return this.client.put('/user/email-settings', data).then(res => res.data)
  }

  uploadPicture(file: File): Promise<UpdateUserPictureOutputDto> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client
      .post('/user/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data)
  }

  async updatePictureFromSocial(socialId: string): Promise<void> {
    await this.client.put(`/user/picture`, {}, { params: { social_id: socialId } }).then(res => res.data)
  }

  async deletePicture(): Promise<void> {
    await this.client.delete(`/user/picture`).then(res => res.data)
  }
}
