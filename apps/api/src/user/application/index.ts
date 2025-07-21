import {
  CreatePasswordVerificationUseCase,
  CreateUserFromGoogleUseCase,
  CreateUserUseCase,
  ResetUserPasswordUseCase,
  UpdateUserEmailSettingUseCase,
  UpdateUserFullUseCase,
  UpdateUserUseCase,
} from './command'
import { UserCreatedUseCase } from './event'
import { PasswordVerificationCreatedUseCase } from './event/password-verification-created.use-case'
import { GetUserByIdUseCase, GetUserEmailSettingUseCase } from './query'

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreateUserFromGoogleUseCase,
  CreatePasswordVerificationUseCase,
  ResetUserPasswordUseCase,
  UpdateUserEmailSettingUseCase,
  UpdateUserUseCase,
  UpdateUserFullUseCase,
  // Queries
  GetUserEmailSettingUseCase,
  GetUserByIdUseCase,
  // Events
  UserCreatedUseCase,
  PasswordVerificationCreatedUseCase,
]
