import { AddSecretSantaUserHandler } from './add-secret-santa-user.handler'
import { CancelSecretSantaHandler } from './cancel-secret-santa.handler'
import { CreateSecretSantaHandler } from './create-secret-santa.handler'
import { DeleteSecretSantaUserHandler } from './delete-secret-santa-user.handler'
import { DeleteSecretSantaHandler } from './delete-secret-santa.handler'
import { GetSecretSantaDrawHandler } from './get-secret-santa-draw.handler'
import { GetSecretSantaHandler } from './get-secret-santa.handler'
import { SecretSantaCancelledHandler } from './secret-santa-cancelled.handler'
import { SecretSantaStartedHandler } from './secret-santa-started.handler'
import { StartSecretSantaHandler } from './start-secret-santa.handler'
import { UpdateSecretSantaUserHandler } from './update-secret-santa-user.handler'
import { UpdateSecretSantaHandler } from './update-secret-santa.handler'

export const handlers = [
  GetSecretSantaHandler,
  GetSecretSantaDrawHandler,
  CreateSecretSantaHandler,
  UpdateSecretSantaHandler,
  DeleteSecretSantaHandler,
  StartSecretSantaHandler,
  CancelSecretSantaHandler,
  AddSecretSantaUserHandler,
  UpdateSecretSantaUserHandler,
  DeleteSecretSantaUserHandler,
  SecretSantaCancelledHandler,
  SecretSantaStartedHandler,
]
