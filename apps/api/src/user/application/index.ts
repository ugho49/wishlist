import { AdminRevokeAllUserSessionsUseCase } from './command/admin-revoke-all-user-sessions.use-case';
import { AdminRevokeUserSessionUseCase } from './command/admin-revoke-user-session.use-case';
import { ConfirmEmailChangeUseCase } from './command/confirm-email-change.use-case';
import { CreateEmailChangeVerificationUseCase } from './command/create-email-change-verification.use-case';
import { CreatePasswordVerificationUseCase } from './command/create-password-verification.use-case';
import { CreateUserUseCase } from './command/create-user.use-case';
import { DeleteUserUseCase } from './command/delete-user.use-case';
import { LinkUserToGoogleUseCase } from './command/link-user-to-google.use-case';
import { RemoveUserPictureUseCase } from './command/remove-user-picture.use-case';
import { ResetUserPasswordUseCase } from './command/reset-user-password.use-case';
import { RevokeUserSessionUseCase } from './command/revoke-user-session.use-case';
import { UnlinkUserAccountUseCase } from './command/unlink-user-account.use-case';
import { UpdateUserUseCase } from './command/update-user.use-case';
import { UpdateUserEmailSettingUseCase } from './command/update-user-email-setting.use-case';
import { UpdateUserFullUseCase } from './command/update-user-full.use-case';
import { UpdateUserPasswordUseCase } from './command/update-user-password.use-case';
import { UpdateUserPictureUseCase } from './command/update-user-picture.use-case';
import { UpdateUserPictureFromAccountUseCase } from './command/update-user-picture-from-account.use-case';
import { EmailChangeVerificationCreatedHandler } from './event/email-change-verification-created.handler';
import { EmailChangedhandler } from './event/email-changed.handler';
import { PasswordVerificationCreatedHandler } from './event/password-verification-created.handler';
import { UserCreatedHandler } from './event/user-created.handler';
import { GetClosestFriendsUseCase } from './query/get-closest-friends.use-case';
import { GetPendingEmailChangeUseCase } from './query/get-pending-email-change.use-case';
import { GetUserAccountsByIdsUseCase } from './query/get-user-accounts-by-ids.use-case';
import { GetUserAccountsByUserIdsUseCase } from './query/get-user-accounts-by-user-ids.use-case';
import { GetUserEmailSettingUseCase } from './query/get-user-email-setting.use-case';
import { GetUserSessionsByUserIdsUseCase } from './query/get-user-sessions-by-user-ids.use-case';
import { GetUsersByCriteriaUseCase } from './query/get-users-by-criteria.use-case';
import { GetUsersByIdsUseCase } from './query/get-users-by-ids.use-case';
import { GetUsersPaginatedUseCase } from './query/get-users-paginated.use-case';

export const handlers = [
  // Commands
  CreateUserUseCase,
  CreateEmailChangeVerificationUseCase,
  ConfirmEmailChangeUseCase,
  CreatePasswordVerificationUseCase,
  LinkUserToGoogleUseCase,
  UnlinkUserAccountUseCase,
  ResetUserPasswordUseCase,
  RevokeUserSessionUseCase,
  AdminRevokeUserSessionUseCase,
  AdminRevokeAllUserSessionsUseCase,
  UpdateUserEmailSettingUseCase,
  UpdateUserUseCase,
  UpdateUserFullUseCase,
  UpdateUserPictureFromAccountUseCase,
  UpdateUserPictureUseCase,
  UpdateUserPasswordUseCase,
  DeleteUserUseCase,
  RemoveUserPictureUseCase,
  // Queries
  GetUserEmailSettingUseCase,
  GetPendingEmailChangeUseCase,
  GetUsersByIdsUseCase,
  GetUsersByCriteriaUseCase,
  GetUsersPaginatedUseCase,
  GetClosestFriendsUseCase,
  GetUserAccountsByUserIdsUseCase,
  GetUserAccountsByIdsUseCase,
  GetUserSessionsByUserIdsUseCase,
  // Events handlers
  UserCreatedHandler,
  PasswordVerificationCreatedHandler,
  EmailChangeVerificationCreatedHandler,
  EmailChangedhandler,
];
