import type { Request, Response } from 'express';

import { type ICurrentUser } from '@wishlist/common';

import { type DataLoaders } from '../../dataloader/dataloader.service';

export type GraphQLContext = {
  user?: ICurrentUser;
  parsedRequest: {
    userAgent?: string;
    ip?: string;
    headers?: {
      authorization?: string;
    };
  };
  req: Request;
  res: Response;
  loaders: DataLoaders;
};
