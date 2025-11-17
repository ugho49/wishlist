import { LoginUseCase } from './command/login.use-case'
import { LoginWithGoogleUseCase } from './command/login-with-google.use-case'

export const handlers = [
  // Commands
  LoginWithGoogleUseCase,
  LoginUseCase,
]
