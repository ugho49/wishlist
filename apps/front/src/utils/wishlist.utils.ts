import type { MiniWishlistDto, WishlistConfigDto } from '@wishlist/common'

const PLACEHOLDER_NAMES = [
  'John',
  'Léo',
  'Lucas',
  'Marc',
  'Julie',
  'Claire',
  'Maxime',
  'Jeanne',
  'Matthieu',
  'Jean',
  'Lou',
  'Quentin',
  'Nico',
  'Pakura',
  'Camille',
  'Manu',
  'Tom',
  'Elise',
  'Louane',
  'Nina',
  'Arthur',
  'Sarah',
  'Fleur',
  'Killian',
  'Bastien',
  'Clément',
]

export const getRandomPlaceholderName = (): string => {
  const randomIndex = Math.floor(Math.random() * PLACEHOLDER_NAMES.length)
  // eslint-disable-next-line security/detect-object-injection
  return PLACEHOLDER_NAMES[randomIndex]!
}

export const getAvatarUrl = (params: {
  wishlist: MiniWishlistDto & { config: WishlistConfigDto }
  ownerPictureUrl?: string
}): string | undefined => {
  const { wishlist, ownerPictureUrl } = params

  if (wishlist.config.hide_items) {
    return wishlist.logo_url ?? ownerPictureUrl
  }

  return wishlist.logo_url
}
