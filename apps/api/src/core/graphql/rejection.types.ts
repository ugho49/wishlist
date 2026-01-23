type FieldError = {
  field: string
  message: string
}

export type ValidationRejection = {
  __typename: 'ValidationRejection'
  errors: FieldError[]
}

export type UnauthorizedRejection = {
  __typename: 'UnauthorizedRejection'
  message: string
}

export type ForbiddenRejection = {
  __typename: 'ForbiddenRejection'
  message: string
}

export type NotFoundRejection = {
  __typename: 'NotFoundRejection'
  message: string
}

export type InternalErrorRejection = {
  __typename: 'InternalErrorRejection'
  message: string
}

export type Rejection =
  | ValidationRejection
  | UnauthorizedRejection
  | ForbiddenRejection
  | NotFoundRejection
  | InternalErrorRejection
