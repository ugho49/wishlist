import { AxiosInstance, AxiosPromise } from 'axios';
import { LoginInputDto, LoginOutputDto } from '@wishlist/common-types';

export interface WishlistApi {
  instance: AxiosInstance;
  login: (data: LoginInputDto) => AxiosPromise<LoginOutputDto>;
}
