import { AxiosInstance } from 'axios';

export type ServiceConstructor = {
  getClient: () => AxiosInstance;
};
