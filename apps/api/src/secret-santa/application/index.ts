import { AddSecretSantaUsersUseCase } from './command/add-secret-santa-users.use-case'
import { CancelSecretSantaUseCase } from './command/cancel-secret-santa.use-case'
import { CreateSecretSantaUseCase } from './command/create-secret-santa.use-case'
import { DeleteSecretSantaUseCase } from './command/delete-secret-santa.use-case'
import { DeleteSecretSantaUserUseCase } from './command/delete-secret-santa-user.use-case'
import { StartSecretSantaUseCase } from './command/start-secret-santa.use-case'
import { UpdateSecretSantaUseCase } from './command/update-secret-santa.use-case'
import { UpdateSecretSantaUserUseCase } from './command/update-secret-santa-user.use-case'
import { SecretSantaCancelledHandler } from './event/secret-santa-cancelled.handler'
import { SecretSantaStartedHandler } from './event/secret-santa-started.handler'
import { GetSecretSantaByEventUseCase } from './query/get-secret-santa-by-event.use-case'
import { GetSecretSantaDrawUseCase } from './query/get-secret-santa-draw.use-case'
import { GetSecretSantaUsersByIdsUseCase } from './query/get-secret-santa-users-by-ids'
import { GetSecretSantaUsersBySecretSantasUseCase } from './query/get-secret-santa-users-by-secret-santas.use-case'

export const handlers = [
  // Queries
  GetSecretSantaByEventUseCase,
  GetSecretSantaDrawUseCase,
  GetSecretSantaUsersByIdsUseCase,
  GetSecretSantaUsersBySecretSantasUseCase,
  // Commands
  CreateSecretSantaUseCase,
  UpdateSecretSantaUseCase,
  DeleteSecretSantaUseCase,
  StartSecretSantaUseCase,
  CancelSecretSantaUseCase,
  AddSecretSantaUsersUseCase,
  UpdateSecretSantaUserUseCase,
  DeleteSecretSantaUserUseCase,
  // Event handlers
  SecretSantaCancelledHandler,
  SecretSantaStartedHandler,
]
