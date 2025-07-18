import {
  CreateWishlistUseCase,
  DeleteWishlistUseCase,
  LinkWishlistToEventUseCase,
  RemoveWishlistLogoUseCase,
  UnlinkWishlistFromEventUseCase,
  UpdateWishlistUseCase,
  UploadWishlistLogoUseCase,
} from './command'
import { GetMyWishlistsUseCase, GetWishlistByIdUseCase } from './query'

export const handlers = [
  // Command handlers
  DeleteWishlistUseCase,
  LinkWishlistToEventUseCase,
  UnlinkWishlistFromEventUseCase,
  CreateWishlistUseCase,
  UpdateWishlistUseCase,
  UploadWishlistLogoUseCase,
  RemoveWishlistLogoUseCase,
  // Query handlers
  GetMyWishlistsUseCase,
  GetWishlistByIdUseCase,
]
