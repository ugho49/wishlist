import {
  LoginInputDto,
  LoginOutputDto,
  LoginWithGoogleInputDto,
  RefreshTokenInputDto,
  RefreshTokenOutputDto,
} from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class AuthService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  login(data: LoginInputDto): Promise<LoginOutputDto> {
    return this.getClient()
      .post(`/auth/login`, data)
      .then((res) => res.data);
  }

  loginWithGoogle(data: LoginWithGoogleInputDto): Promise<LoginOutputDto> {
    return this.getClient()
      .post(`/auth/login/google`, data)
      .then((res) => res.data);
  }

  refreshToken(data: RefreshTokenInputDto): Promise<RefreshTokenOutputDto> {
    return this.getClient()
      .post(`/auth/refresh`, data)
      .then((res) => res.data);
  }
}
