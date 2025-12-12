import type { LoginOutputDto } from '@wishlist/common'
import type { LoginResultObject } from '../types'

export const authGraphQLMapper = {
  toLoginResultObject(dto: LoginOutputDto): LoginResultObject {
    return {
      accessToken: dto.access_token,
      newUserCreated: dto.new_user_created,
      linkedToExistingUser: dto.linked_to_existing_user,
    }
  },
}
