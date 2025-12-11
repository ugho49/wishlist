import { AddSecretSantaUsersUseCase } from './add-secret-santa-users.use-case'
import { CancelSecretSantaUseCase } from './cancel-secret-santa.use-case'
import { CreateSecretSantaUseCase } from './create-secret-santa.use-case'
import { DeleteSecretSantaUseCase } from './delete-secret-santa.use-case'
import { DeleteSecretSantaUserUseCase } from './delete-secret-santa-user.use-case'
import { GetSecretSantaUseCase } from './get-secret-santa.use-case'
import { GetSecretSantaDrawUseCase } from './get-secret-santa-draw.use-case'
import { SecretSantaCancelledUseCase } from './secret-santa-cancelled.use-case'
import { SecretSantaStartedUseCase } from './secret-santa-started.use-case'
import { StartSecretSantaUseCase } from './start-secret-santa.use-case'
import { UpdateSecretSantaUseCase } from './update-secret-santa.use-case'
import { UpdateSecretSantaUserUseCase } from './update-secret-santa-user.use-case'

export const handlers = [
  GetSecretSantaUseCase,
  GetSecretSantaDrawUseCase,
  CreateSecretSantaUseCase,
  UpdateSecretSantaUseCase,
  DeleteSecretSantaUseCase,
  StartSecretSantaUseCase,
  CancelSecretSantaUseCase,
  AddSecretSantaUsersUseCase,
  UpdateSecretSantaUserUseCase,
  DeleteSecretSantaUserUseCase,
  SecretSantaCancelledUseCase,
  SecretSantaStartedUseCase,
]
