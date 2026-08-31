import { LoginUseCase } from './commands/login.use-case';
import { LoginWithGoogleUseCase } from './commands/login-with-google.use-case';
import { LogoutUseCase } from './commands/logout.use-case';
import { RefreshSessionUseCase } from './commands/refresh-session.use-case';

export const handlers = [
  // Commands
  LoginWithGoogleUseCase,
  LoginUseCase,
  RefreshSessionUseCase,
  LogoutUseCase,
];
