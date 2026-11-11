import type { GraphQLResultMapper } from '@znight/graphql';
import type { InternalErrorRejection, Rejection } from './rejection.types';

import { Injectable } from '@znight/core';
import { GraphQLErrorCode, GraphQLException } from '@znight/graphql';
import { ForbiddenException, HttpException, NotFoundException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { BusinessRuleException } from '../common/business-rule.exception';
import { trackErrorWithDatadog } from '../filters/datadog-error.tracker';

const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred';

type ValidationIssue = { readonly path: string; readonly message: string };

const logger = getLogger('GraphQLErrorPlugin');

/**
 * Maps an error thrown by a root field (its guards, its argument validation or the resolver) to the
 * rejection type the front expects in the field's result union.
 */
export function toRejection(error: unknown): Rejection {
  if (error instanceof GraphQLException && error.code === GraphQLErrorCode.BadUserInput) {
    const issues = (error.extensions?.['issues'] ?? []) as readonly ValidationIssue[];
    return {
      __typename: 'ValidationRejection',
      errors: issues.map(issue => ({ field: issue.path, message: issue.message })),
    };
  }

  // Must come before the generic HttpException branch: BusinessRuleException extends BadRequestException
  if (error instanceof BusinessRuleException) {
    return { __typename: 'BusinessRuleRejection', code: error.code, message: error.message };
  }

  if (error instanceof UnauthorizedException) {
    return { __typename: 'UnauthorizedRejection', message: error.message || 'Unauthorized' };
  }

  if (error instanceof NotFoundException) {
    return { __typename: 'NotFoundRejection', message: error.message || 'Not found' };
  }

  if (error instanceof ForbiddenException) {
    return { __typename: 'ForbiddenRejection', message: error.message || 'Forbidden' };
  }

  // A guard returning false
  if (error instanceof GraphQLException && error.code === GraphQLErrorCode.Forbidden) {
    return { __typename: 'ForbiddenRejection', message: error.message || 'Forbidden' };
  }

  if (error instanceof HttpException) {
    return { __typename: 'InternalErrorRejection', message: error.message || UNEXPECTED_ERROR_MESSAGE };
  }

  trackErrorWithDatadog(error);
  logger.error(UNEXPECTED_ERROR_MESSAGE, { error });

  return { __typename: 'InternalErrorRejection', message: UNEXPECTED_ERROR_MESSAGE };
}

/**
 * Errors as data: turns the errors of a root field into the rejection member of its result union
 * (`ValidationRejection`, `NotFoundRejection`...). GraphQL still answers HTTP 200.
 */
@Injectable()
export class RejectionResultMapper implements GraphQLResultMapper {
  static readonly types = [
    'ValidationRejection',
    'BusinessRuleRejection',
    'UnauthorizedRejection',
    'NotFoundRejection',
    'ForbiddenRejection',
    'InternalErrorRejection',
  ];

  toResult(error: unknown): Rejection {
    return toRejection(error);
  }
}

/**
 * Fallback for rejections the field's union does not declare (a `NotFoundRejection` on a field
 * without it): every result union holds `InternalErrorRejection`.
 */
@Injectable()
export class InternalErrorResultMapper implements GraphQLResultMapper {
  static readonly types = ['InternalErrorRejection'];

  toResult(error: unknown): InternalErrorRejection {
    const message = error instanceof Error && error.message ? error.message : UNEXPECTED_ERROR_MESSAGE;
    return { __typename: 'InternalErrorRejection', message };
  }
}
