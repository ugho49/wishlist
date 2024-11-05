import type { CreateAxiosDefaults } from 'axios'

import axios from 'axios'

import {
  AdminEventService,
  AdminUserService,
  AttendeeService,
  AuthService,
  EventService,
  ItemService,
  SecretSantaService,
  UserService,
  WishlistService,
} from './services'

type ClientServiceParams = {
  baseURL: string
  timeoutInMs?: number
  accessToken?: string
}

export class ApiClient {
  private constructor(
    public readonly auth: AuthService,
    public readonly user: UserService,
    public readonly wishlist: WishlistService,
    public readonly event: EventService,
    public readonly item: ItemService,
    public readonly attendee: AttendeeService,
    public readonly secretSanta: SecretSantaService,
    public readonly admin: {
      user: AdminUserService
      event: AdminEventService
    },
  ) {}

  static create(params: ClientServiceParams) {
    const config: CreateAxiosDefaults = {
      baseURL: params.baseURL,
      timeout: params?.timeoutInMs ?? 10_000, // 10 seconds
    }

    if (params.accessToken) {
      config.headers = { Authorization: `Bearer ${params.accessToken}` }
    }

    const client = axios.create(config)

    return new ApiClient(
      new AuthService(client),
      new UserService(client),
      new WishlistService(client),
      new EventService(client),
      new ItemService(client),
      new AttendeeService(client),
      new SecretSantaService(client),
      {
        user: new AdminUserService(client),
        event: new AdminEventService(client),
      },
    )
  }
}
