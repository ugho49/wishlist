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
  wishlist: { logoUrl?: string | null; config: { hideItems: boolean } }
  ownerPictureUrl?: string | null
}): string | undefined => {
  const { wishlist, ownerPictureUrl } = params

  if (wishlist.config.hideItems) {
    return wishlist.logoUrl ?? ownerPictureUrl ?? undefined
  }

  return wishlist.logoUrl ?? undefined
}
