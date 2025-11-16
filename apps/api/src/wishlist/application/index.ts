import {
  AddCoOwnerUseCase,
  CreateWishlistUseCase,
  DeleteWishlistUseCase,
  LinkWishlistToEventUseCase,
  RemoveCoOwnerUseCase,
  RemoveWishlistLogoUseCase,
  UnlinkWishlistFromEventUseCase,
  UpdateWishlistUseCase,
  UploadWishlistLogoUseCase,
} from './command'
import { GetMyWishlistsUseCase, GetWishlistByIdUseCase } from './query'

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
  GetMyWishlistsUseCase,
  GetWishlistByIdUseCase,
]
