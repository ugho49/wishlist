import {
  CreatePasswordVerificationUseCase,
  CreateUserFromGoogleUseCase,
  CreateUserUseCase,
  ResetUserPasswordUseCase,
} from './command'
import { UserCreatedUseCase } from './event'
import { PasswordVerificationCreatedUseCase } from './event/password-verification-created.use-case'

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreateUserFromGoogleUseCase,
  CreatePasswordVerificationUseCase,
  ResetUserPasswordUseCase,
  // Queries
  // Events
  UserCreatedUseCase,
  PasswordVerificationCreatedUseCase,
]
