import type {
  AddEventAttendeeForEventInputDto,
  AddItemForListInputDto,
  AddItemInputDto,
  AttendeeDto,
  ChangeUserPasswordInputDto,
  CreateEventInputDto,
  CreateWishlistInputDto,
  DetailedEventDto,
  DetailedWishlistDto,
  EventWithCountsAndCreatorDto,
  EventWithCountsDto,
  GetAllUsersQueryDto,
  GetPaginationQueryDto,
  ItemDto,
  LinkUnlinkWishlistInputDto,
  LoginInputDto,
  LoginOutputDto,
  MiniEventDto,
  MiniUserDto,
  MiniWishlistDto,
  PagedResponse,
  RefreshTokenInputDto,
  RefreshTokenOutputDto,
  RegisterUserInputDto,
  ResetPasswordInputDto,
  ResetPasswordValidationInputDto,
  UpdateEventInputDto,
  UpdateFullUserProfileInputDto,
  UpdateUserEmailSettingsInputDto,
  UpdateUserProfileInputDto,
  UpdateWishlistInputDto,
  UserDto,
  UserEmailSettingsDto,
  WishlistWithEventsDto,
} from '@wishlist/common-types';

export type WishlistApi = {
  axios: {
    setAuthorizationHeader: (value: string) => void;
    removeAuthorizationHeader: () => void;
  };

  auth: {
    login: (data: LoginInputDto) => Promise<LoginOutputDto>;
    refreshToken: (data: RefreshTokenInputDto) => Promise<RefreshTokenOutputDto>;
  };

  user: {
    getInfo: () => Promise<UserDto>;
    register: (data: RegisterUserInputDto) => Promise<MiniUserDto>;
    update: (data: UpdateUserProfileInputDto) => Promise<void>;
    changePassword: (data: ChangeUserPasswordInputDto) => Promise<void>;
    searchUserByKeyword: (keyword: string) => Promise<MiniUserDto[]>;
    sendResetUserPasswordEmail: (data: ResetPasswordInputDto) => Promise<void>;
    validateResetPassword: (data: ResetPasswordValidationInputDto) => Promise<void>;
    getEmailSettings: () => Promise<UserEmailSettingsDto>;
    updateUserEmailSettings: (data: UpdateUserEmailSettingsInputDto) => Promise<UserEmailSettingsDto>;
    admin: {
      getById: (userId: string) => Promise<UserDto>;
      getAll: (params: GetAllUsersQueryDto) => Promise<PagedResponse<UserDto>>;
      update: (userId: string, data: UpdateFullUserProfileInputDto) => Promise<void>;
      delete: (userId: string) => Promise<void>;
    };
  };

  event: {
    geById: (eventId: string) => Promise<DetailedEventDto>;
    getAll: (params: GetPaginationQueryDto) => Promise<PagedResponse<EventWithCountsDto>>;
    create: (data: CreateEventInputDto) => Promise<MiniEventDto>;
    update: (eventId: string, data: UpdateEventInputDto) => Promise<void>;
    delete: (eventId: string) => Promise<void>;
    admin: {
      getById: (eventId: string) => Promise<DetailedEventDto>;
      getAll: (params: GetPaginationQueryDto) => Promise<PagedResponse<EventWithCountsAndCreatorDto>>;
    };
  };

  attendee: {
    addAttendee: (data: AddEventAttendeeForEventInputDto) => Promise<AttendeeDto>;
    deleteAttendee: (attendeeId: string) => Promise<void>;
  };

  item: {
    create: (data: AddItemForListInputDto) => Promise<ItemDto>;
    update: (itemId: string, data: AddItemInputDto) => Promise<void>;
    delete: (itemId: string) => Promise<void>;
    toggle: (itemId: string) => Promise<void>;
  };

  wishlist: {
    getById: (wishlistId: string) => Promise<DetailedWishlistDto>;
    getAll: (params: GetPaginationQueryDto) => Promise<PagedResponse<WishlistWithEventsDto>>;
    create: (data: CreateWishlistInputDto) => Promise<MiniWishlistDto>;
    update: (wishlistId: string, data: UpdateWishlistInputDto) => Promise<void>;
    delete: (wishlistId: string) => Promise<void>;
    linkWishlistToAnEvent: (wishlistId: string, data: LinkUnlinkWishlistInputDto) => Promise<void>;
    unlinkWishlistToAnEvent: (wishlistId: string, data: LinkUnlinkWishlistInputDto) => Promise<void>;
  };
};
