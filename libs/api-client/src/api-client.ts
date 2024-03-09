import axios, { XiorRequestConfig as CreateAxiosDefaults } from 'xior';
import { AuthService } from './modules/auth.service';
import { UserService } from './modules/user.service';
import { AdminUserService } from './modules/admin-user.service';
import { WishlistService } from './modules/wishlist.service';
import { AdminEventService } from './modules/admin-event.service';
import { EventService } from './modules/event.service';
import { ItemService } from './modules/item.service';
import { AttendeeService } from './modules/attendee.service';

type ClientServiceParams = {
  baseURL: string;
  timeoutInMs?: number;
};

export class ApiClient {
  private readonly client: axios;

  constructor(private readonly params: ClientServiceParams) {
    const config: CreateAxiosDefaults = {
      baseURL: this.params.baseURL,
      timeout: this.params?.timeoutInMs ?? 10_000, // 10 seconds
    };

    this.client = axios.create(config);
  }

  get auth() {
    return new AuthService(this.client);
  }

  get user() {
    return new UserService(this.client);
  }

  user2() {
    return new UserService(this.client);
  }

  get wishlist() {
    return new WishlistService(this.client);
  }

  get event() {
    return new EventService(this.client);
  }

  get item() {
    return new ItemService(this.client);
  }

  get attendee() {
    return new AttendeeService(this.client);
  }

  get admin() {
    return {
      user: new AdminUserService(this.client),
      event: new AdminEventService(this.client),
    };
  }

  setAccessToken(token: string) {
    if (!this.client.config?.headers) {
      this.client.config = this.client.config || {};
      this.client.config.headers = {};
    }
    this.client.config.headers['Authorization'] = `Bearer ${token}`;
  }

  removeUserToken() {
    delete this.client.config?.headers?.['Authorization'];
  }
}
