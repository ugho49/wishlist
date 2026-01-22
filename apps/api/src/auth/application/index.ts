import { LoginUseCase } from './use-case/login.use-case'
import { LoginWithGoogleUseCase } from './use-case/login-with-google.use-case'

export const handlers = [
  // Commands
  LoginWithGoogleUseCase,
  LoginUseCase,
]
