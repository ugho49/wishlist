import { ICurrentUser } from '@wishlist/common'

import { DataLoaders } from '../../dataloader/dataloader.service'

export type GraphQLContext = {
  req: Request & { user?: ICurrentUser }
  loaders: DataLoaders
}
