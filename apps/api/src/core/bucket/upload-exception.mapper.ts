import { Injectable } from '@znight/core';
import {
  BadRequestException,
  type ExceptionMapper,
  HttpResponse,
  PayloadTooLargeException,
  ValidationException,
} from '@znight/http';

import { IMAGE_TOO_LARGE_MESSAGE } from './image-resizer';

const hasField = (details: unknown): boolean => typeof details === 'object' && details !== null && 'field' in details;

/**
 * Keeps the contract of the REST upload routes: a refused picture is a 400 with a French message
 * (not a 413), and an invalid multipart `data` field lists its messages in `message`. The picture
 * type is checked from the content by `ImageResizer` (400 too), not from the declared media type.
 */
@Injectable()
export class UploadExceptionMapper implements ExceptionMapper {
  map(error: unknown): BadRequestException | HttpResponse | undefined {
    if (error instanceof PayloadTooLargeException && hasField(error.details)) {
      return new BadRequestException(IMAGE_TOO_LARGE_MESSAGE);
    }
    if (error instanceof ValidationException && error.location === 'body') {
      return new HttpResponse(
        { statusCode: 400, error: 'Bad Request', message: error.issues.map(issue => issue.message) },
        { status: 400 },
      );
    }
    return undefined;
  }
}
