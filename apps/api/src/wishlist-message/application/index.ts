import { CreateWishlistMessageUseCase } from './command/create-wishlist-message.use-case'
import { DeleteWishlistMessageUseCase } from './command/delete-wishlist-message.use-case'
import { GetWishlistMessagesUseCase } from './query/get-wishlist-messages.use-case'

export const handlers = [
  // Commands
  CreateWishlistMessageUseCase,
  DeleteWishlistMessageUseCase,
  // Queries
  GetWishlistMessagesUseCase,
]
