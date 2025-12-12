import { AddCoOwnerUseCase } from './command/add-co-owner.use-case'
import { CreateWishlistUseCase } from './command/create-wishlist.use-case'
import { DeleteWishlistUseCase } from './command/delete-wishlist.use-case'
import { LinkWishlistToEventUseCase } from './command/link-wishlist-to-event.use-case'
import { RemoveCoOwnerUseCase } from './command/remove-co-owner.use-case'
import { RemoveWishlistLogoUseCase } from './command/remove-wishlist-logo.use-case'
import { UnlinkWishlistFromEventUseCase } from './command/unlink-wishlist-from-event.use-case'
import { UpdateWishlistUseCase } from './command/update-wishlist.use-case'
import { UploadWishlistLogoUseCase } from './command/upload-wishlist-logo.use-case'
import { UserAddedAsCoOwnerToWishlistUseCase } from './event/user-added-as-co-owner-to-wishlist.use-case'
import { GetWishlistByIdUseCase } from './query/get-wishlist-by-id.use-case'
import { GetWishlistsByIdsUseCase } from './query/get-wishlists-by-ids.use-case'
import { GetWishlistsByOwnerUseCase } from './query/get-wishlists-by-owner.use-case'
import { GetWishlistsByUserUseCase } from './query/get-wishlists-by-user.use-case'

export const handlers = [
  // Command handlers
  AddCoOwnerUseCase,
  CreateWishlistUseCase,
  DeleteWishlistUseCase,
  LinkWishlistToEventUseCase,
  RemoveCoOwnerUseCase,
  RemoveWishlistLogoUseCase,
  UnlinkWishlistFromEventUseCase,
  UpdateWishlistUseCase,
  UploadWishlistLogoUseCase,
  // Query handlers
  GetWishlistsByOwnerUseCase,
  GetWishlistsByUserUseCase,
  GetWishlistByIdUseCase,
  GetWishlistsByIdsUseCase,
  // Event handlers
  UserAddedAsCoOwnerToWishlistUseCase,
]
