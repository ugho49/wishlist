import { type BusinessRuleCode } from '../common/business-rule.exception';

type FieldError = {
  field: string;
  message: string;
};

export type ValidationRejection = {
  __typename: 'ValidationRejection';
  errors: FieldError[];
};

export type BusinessRuleRejection = {
  __typename: 'BusinessRuleRejection';
  code: BusinessRuleCode;
  message: string;
};

export type UnauthorizedRejection = {
  __typename: 'UnauthorizedRejection';
  message: string;
};

export type ForbiddenRejection = {
  __typename: 'ForbiddenRejection';
  message: string;
};

export type NotFoundRejection = {
  __typename: 'NotFoundRejection';
  message: string;
};

export type InternalErrorRejection = {
  __typename: 'InternalErrorRejection';
  message: string;
};

export type Rejection =
  | ValidationRejection
  | BusinessRuleRejection
  | UnauthorizedRejection
  | ForbiddenRejection
  | NotFoundRejection
  | InternalErrorRejection;
