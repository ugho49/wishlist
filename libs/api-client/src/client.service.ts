import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { AuthService } from './modules/auth.service';
import { UserService } from './modules/user.service';
import { AdminUserService } from './modules/admin-user.service';
import { WishlistService } from './modules/wishlist.service';
import { AdminEventService } from './modules/admin-event.service';
import { EventService } from './modules/event.service';
import { ItemService } from './modules/item.service';
import { AttendeeService } from './modules/attendee.service';

export type ClientServiceParams = {
  baseURL: string;
  timeoutInMs?: number;
};

export class ClientService {
  private client: AxiosInstance;

  constructor(private readonly params: ClientServiceParams) {
    this.client = this.getNewInstance({});
  }

  auth() {
    return new AuthService({ getClient: () => this.client });
  }

  user() {
    return new UserService({ getClient: () => this.client });
  }

  wishlist() {
    return new WishlistService({ getClient: () => this.client });
  }

  event() {
    return new EventService({ getClient: () => this.client });
  }

  item() {
    return new ItemService({ getClient: () => this.client });
  }

  attendee() {
    return new AttendeeService({ getClient: () => this.client });
  }

  admin() {
    return {
      user: new AdminUserService({ getClient: () => this.client }),
      event: new AdminEventService({ getClient: () => this.client }),
    };
  }

  setAccessToken(token: string) {
    this.client = this.getNewInstance({ accessToken: token });
  }

  removeUserToken() {
    this.client = this.getNewInstance({});
  }

  private getNewInstance(params: { accessToken?: string }): AxiosInstance {
    const { accessToken } = params;
    let config: CreateAxiosDefaults = {
      baseURL: this.params.baseURL,
      timeout: this.params?.timeoutInMs ?? 10_000, // 10 seconds
    };

    if (accessToken) {
      config = {
        ...config,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }

    return axios.create(config);
  }
}
