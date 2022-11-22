import axios, { AxiosInstance, AxiosPromise } from 'axios';
import { createApiRef } from '@wishlist/common-front';
import { environment } from '../../environments/environment';
import { WishlistApi } from '../../@types/api.type';
import { LoginInputDto, LoginOutputDto } from '@wishlist/common-types';

export const wishlistApiRef = createApiRef<WishlistApi>({
  id: 'wishlist-api',
});

export class WishlistApiImpl implements WishlistApi {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: environment.baseUrl,
      timeout: 30000, // 30 seconds
    });
  }

  login(data: LoginInputDto): AxiosPromise<LoginOutputDto> {
    return this.instance.post(`/auth/login`, data);
  }
}
