import type { LoginInputDto, LoginOutputDto, LoginWithGoogleInputDto } from '@wishlist/common'
import type { AxiosInstance } from 'axios'

export class AuthService {
  constructor(private readonly client: AxiosInstance) {}

  login(data: LoginInputDto): Promise<LoginOutputDto> {
    return this.client.post('/auth/login', data).then(res => res.data)
  }

  loginWithGoogle(data: LoginWithGoogleInputDto): Promise<LoginOutputDto> {
    return this.client.post('/auth/login/google', data).then(res => res.data)
  }
}
