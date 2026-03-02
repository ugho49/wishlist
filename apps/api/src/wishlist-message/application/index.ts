import { CreateWishlistMessageUseCase } from './command/create-wishlist-message.use-case'
import { DeleteWishlistMessageUseCase } from './command/delete-wishlist-message.use-case'
import { MarkWishlistMessagesAsReadUseCase } from './command/mark-wishlist-messages-as-read.use-case'
import { GetWishlistMessagesUseCase } from './query/get-wishlist-messages.use-case'

export const handlers = [
  // Commands
  CreateWishlistMessageUseCase,
  DeleteWishlistMessageUseCase,
  MarkWishlistMessagesAsReadUseCase,
  // Queries
  GetWishlistMessagesUseCase,
]
