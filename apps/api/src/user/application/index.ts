import {
  CreatePasswordVerificationUseCase,
  CreateUserFromGoogleUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  RemoveUserPictureUseCase,
  ResetUserPasswordUseCase,
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
  GetUserByIdUseCase,
  GetUserEmailSettingUseCase,
  GetUsersByCriteriaUseCase,
  GetUsersPaginatedUseCase,
} from './query'

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreateUserFromGoogleUseCase,
  CreatePasswordVerificationUseCase,
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
  // Events
  UserCreatedUseCase,
  PasswordVerificationCreatedUseCase,
]
