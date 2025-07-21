import { CreatePasswordVerificationUseCase, CreateUserUseCase, ResetUserPasswordUseCase } from './command'
import { UserCreatedUseCase } from './event'
import { PasswordVerificationCreatedUseCase } from './event/password-verification-created.use-case'

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreatePasswordVerificationUseCase,
  ResetUserPasswordUseCase,
  // Queries
  // Events
  UserCreatedUseCase,
  PasswordVerificationCreatedUseCase,
]
