import { LoginUseCase } from './commands/login.use-case'
import { LoginWithGoogleUseCase } from './commands/login-with-google.use-case'

export const handlers = [
  // Commands
  LoginWithGoogleUseCase,
  LoginUseCase,
]
