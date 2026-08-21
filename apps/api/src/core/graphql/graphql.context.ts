import { type ICurrentUser } from '@wishlist/common'

import { type DataLoaders } from '../../dataloader/dataloader.service'

export type GraphQLContext = {
  req: Request & { user?: ICurrentUser }
  loaders: DataLoaders
}
