import type { MiniUserDto } from '@wishlist/common'

import type { User } from '../domain/user.model'

function toMiniUserDto(model: User): MiniUserDto {
  return {
    id: model.id,
    firstname: model.firstName,
    lastname: model.lastName,
    email: model.email,
    picture_url: model.pictureUrl,
  }
}

export const userMapper = {
  toMiniUserDto,
}
