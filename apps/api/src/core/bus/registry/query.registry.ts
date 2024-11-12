import type { GetSecretSantaHandlerDefinition } from '../../../domain/secret-santa/use-cases/get-secret-santa'
import type { GetSecretSantaDrawHandlerDefinition } from '../../../domain/secret-santa/use-cases/get-secret-santa-draw'

export type QueryHandlerRegistry = GetSecretSantaHandlerDefinition & GetSecretSantaDrawHandlerDefinition
