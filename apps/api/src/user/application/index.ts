import { CreatePasswordVerificationUseCase } from './command/create-password-verification.use-case'
import { CreateUserUseCase } from './command/create-user.use-case'
import { DeleteUserUseCase } from './command/delete-user.use-case'
import { LinkUserToGoogleUseCase } from './command/link-user-to-google.use-case'
import { RemoveUserPictureUseCase } from './command/remove-user-picture.use-case'
import { ResetUserPasswordUseCase } from './command/reset-user-password.use-case'
import { UnlinkUserSocialUseCase } from './command/unlink-user-social.use-case'
import { UpdateUserUseCase } from './command/update-user.use-case'
import { UpdateUserEmailSettingUseCase } from './command/update-user-email-setting.use-case'
import { UpdateUserFullUseCase } from './command/update-user-full.use-case'
import { UpdateUserPasswordUseCase } from './command/update-user-password.use-case'
import { UpdateUserPictureUseCase } from './command/update-user-picture.use-case'
import { UpdateUserPictureFromSocialUseCase } from './command/update-user-picture-from-social.use-case'
import { PasswordVerificationCreatedUseCase } from './event/password-verification-created.use-case'
import { UserCreatedUseCase } from './event/user-created.use-case'
import { GetClosestFriendsUseCase } from './query/get-closest-friends.use-case'
import { GetUserByIdUseCase } from './query/get-user-by-id.use-case'
import { GetUserEmailSettingUseCase } from './query/get-user-email-setting.use-case'
import { GetUsersByCriteriaUseCase } from './query/get-users-by-criteria.use-case'
import { GetUsersPaginatedUseCase } from './query/get-users-paginated.use-case'

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreatePasswordVerificationUseCase,
  LinkUserToGoogleUseCase,
  UnlinkUserSocialUseCase,
  ResetUserPasswordUseCase,
  UpdateUserEmailSettingUseCase,
  UpdateUserUseCase,
  UpdateUserFullUseCase,
  UpdateUserPictureFromSocialUseCase,
  UpdateUserPictureUseCase,
  UpdateUserPasswordUseCase,
  DeleteUserUseCase,
  RemoveUserPictureUseCase,
  // Queries
  GetUserEmailSettingUseCase,
  GetUserByIdUseCase,
  GetUsersByCriteriaUseCase,
  GetUsersPaginatedUseCase,
  GetClosestFriendsUseCase,
  // Events
  UserCreatedUseCase,
  PasswordVerificationCreatedUseCase,
]
