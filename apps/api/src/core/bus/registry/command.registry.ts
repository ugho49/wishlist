import type { AddSecretSantaUserHandlerDefinition } from '../../../domain/secret-santa/use-cases/add-secret-santa-user'
import type { CancelSecretSantaHandlerDefinition } from '../../../domain/secret-santa/use-cases/cancel-secret-santa'
import type { CreateSecretSantaHandlerDefinition } from '../../../domain/secret-santa/use-cases/create-secret-santa'
import type { DeleteSecretSantaHandlerDefinition } from '../../../domain/secret-santa/use-cases/delete-secret-santa'
import type { DeleteSecretSantaUserHandlerDefinition } from '../../../domain/secret-santa/use-cases/delete-secret-santa-user'
import type { StartSecretSantaHandlerDefinition } from '../../../domain/secret-santa/use-cases/start-secret-santa'
import type { UpdateSecretSantaHandlerDefinition } from '../../../domain/secret-santa/use-cases/update-secret-santa'
import type { UpdateSecretSantaUserHandlerDefinition } from '../../../domain/secret-santa/use-cases/update-secret-santa-user'

export type CommandHandlerRegistry = CreateSecretSantaHandlerDefinition &
  UpdateSecretSantaHandlerDefinition &
  DeleteSecretSantaHandlerDefinition &
  StartSecretSantaHandlerDefinition &
  CancelSecretSantaHandlerDefinition &
  AddSecretSantaUserHandlerDefinition &
  UpdateSecretSantaUserHandlerDefinition &
  DeleteSecretSantaUserHandlerDefinition
