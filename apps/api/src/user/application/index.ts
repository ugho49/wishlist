import {
  CreatePasswordVerificationUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  LinkUserToGoogleUseCase,
  RemoveUserPictureUseCase,
  ResetUserPasswordUseCase,
  UnlinkUserSocialUseCase,
  UpdateUserEmailSettingUseCase,
  UpdateUserFullUseCase,
  UpdateUserPasswordUseCase,
  UpdateUserPictureFromSocialUseCase,
  UpdateUserPictureUseCase,
  UpdateUserUseCase,
} from './command'
import { UserCreatedUseCase } from './event'
import { PasswordVerificationCreatedUseCase } from './event/password-verification-created.use-case'
import {
  GetClosestFriendsUseCase,
  GetUserByIdUseCase,
  GetUserEmailSettingUseCase,
  GetUsersByCriteriaUseCase,
  GetUsersPaginatedUseCase,
} from './query'

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreatePasswordVerificationUseCase,
  LinkUserToGoogleUseCase,
  UnlinkUserSocialUseCase,
  ResetUserPasswordUseCase,
  UpdateUserEmailSettingUseCase,
  UpdateUserUseCase,
  UpdateUserFullUseCase,
  UpdateUserPictureFromSocialUseCase,
  UpdateUserPictureUseCase,
  UpdateUserPasswordUseCase,
  DeleteUserUseCase,
  RemoveUserPictureUseCase,
  // Queries
  GetUserEmailSettingUseCase,
  GetUserByIdUseCase,
  GetUsersByCriteriaUseCase,
  GetUsersPaginatedUseCase,
  GetClosestFriendsUseCase,
  // Events
  UserCreatedUseCase,
  PasswordVerificationCreatedUseCase,
]
