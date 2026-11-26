import type { User, UserMergeProfileSelection } from '../../domain/model/user.model';
import type { UserAccount } from '../../domain/model/user-account.model';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type {
  UserMergeAttendance,
  UserMergeFootprint,
  UserMergeRepository,
  UserMergeTransfer,
} from '../../domain/repository/user-merge.repository';

import { type EventId, type ICurrentUser, type UserAccountId, type UserId, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { AttendeeRole } from '../../../event/domain/attendee-role.enum';
import { findMergeableUsers } from '../user-merge.access';

export type MergeUsersInput = {
  currentUser: ICurrentUser;
  /** Merged user, deleted at the end with everything not transferred */
  sourceUserId: UserId;
  /** Kept user */
  targetUserId: UserId;
  profile: UserMergeProfileSelection;
  /** Source login accounts to keep; one replaces the target account of the same provider */
  accountIds: UserAccountId[];
  /** Events only the source attends that the target joins (shared events are always merged) */
  eventIds: EventId[];
  /** Wishlists the source owns or co-owns that go to the target */
  wishlistIds: WishlistId[];
  transferReservations: boolean;
};

export type MergeUsersOutput = {
  user: User;
};

const ROLE_RANK: Record<AttendeeRole, number> = {
  [AttendeeRole.PARTICIPANT]: 0,
  [AttendeeRole.ADMIN]: 1,
  [AttendeeRole.CREATOR]: 2,
};

const invalidMerge = (message: string) => new BusinessRuleException('INVALID_USER_MERGE', message);

@Injectable()
export class MergeUsersUseCase {
  private readonly logger = getLogger(MergeUsersUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userMergeRepository: UserMergeRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: MergeUsersInput): Promise<MergeUsersOutput> {
    const { currentUser, sourceUserId, targetUserId } = input;
    this.logger.info('Merge users request received', {
      sourceUserId,
      targetUserId,
      profile: input.profile,
      accountIds: input.accountIds,
      eventIds: input.eventIds,
      wishlistIds: input.wishlistIds,
      transferReservations: input.transferReservations,
    });

    const { source, target } = await findMergeableUsers({
      userRepository: this.userRepository,
      currentUser,
      sourceUserId,
      targetUserId,
    });

    const [sourceAccounts, targetAccounts, sourceFootprint, targetFootprint] = await Promise.all([
      this.userAccountRepository.findByUserId(source.id),
      this.userAccountRepository.findByUserId(target.id),
      this.userMergeRepository.findFootprint(source.id),
      this.userMergeRepository.findFootprint(target.id),
    ]);

    const transfer: UserMergeTransfer = {
      sourceUserId: source.id,
      targetUserId: target.id,
      ...this.planAccounts({ selectedIds: input.accountIds, sourceAccounts, targetAccounts }),
      ...this.planEventsAndWishlists({
        source,
        target,
        selectedEventIds: input.eventIds,
        selectedWishlistIds: input.wishlistIds,
        sourceFootprint,
        targetFootprint,
      }),
      transferReservations: input.transferReservations,
    };

    const mergedUser = target.absorbProfile(source, input.profile);

    this.logger.info('Merging users...', { transfer });
    await this.transactionManager.runInTransaction(async tx => {
      await this.userMergeRepository.transfer(transfer, tx);
      // The source goes first: the kept user may take its email (unique)
      await this.userRepository.delete(source.id, tx);
      await this.userRepository.save(mergedUser, tx);
    });

    this.logger.info('Users merged', { sourceUserId, targetUserId });
    return { user: mergedUser };
  }

  private planAccounts(params: {
    selectedIds: UserAccountId[];
    sourceAccounts: UserAccount[];
    targetAccounts: UserAccount[];
  }): Pick<UserMergeTransfer, 'accountIds' | 'replacedTargetAccountIds'> {
    const selected = [...new Set(params.selectedIds)].map(accountId => {
      const account = params.sourceAccounts.find(a => a.id === accountId);
      if (!account) {
        throw invalidMerge(`Account ${accountId} does not belong to the merged user`);
      }
      return account;
    });

    const replacedTargetAccountIds = params.targetAccounts
      .filter(account => selected.some(s => s.provider === account.provider))
      .map(account => account.id);

    return { accountIds: selected.map(account => account.id), replacedTargetAccountIds };
  }

  private planEventsAndWishlists(params: {
    source: User;
    target: User;
    selectedEventIds: EventId[];
    selectedWishlistIds: WishlistId[];
    sourceFootprint: UserMergeFootprint;
    targetFootprint: UserMergeFootprint;
  }): Omit<
    UserMergeTransfer,
    'sourceUserId' | 'targetUserId' | 'accountIds' | 'replacedTargetAccountIds' | 'transferReservations'
  > {
    const { source, target, sourceFootprint, targetFootprint } = params;
    const selectedEventIds = new Set(params.selectedEventIds);
    const targetAttendanceByEvent = new Map(targetFootprint.attendances.map(a => [a.eventId, a]));
    const sourceOnlyAttendances = sourceFootprint.attendances.filter(a => !targetAttendanceByEvent.has(a.eventId));
    const sourceOnlyEventIds = new Set(sourceOnlyAttendances.map(a => a.eventId));

    for (const eventId of selectedEventIds) {
      if (!sourceOnlyEventIds.has(eventId)) {
        throw invalidMerge(`Event ${eventId} is not an event only the merged user attends`);
      }
    }

    for (const attendance of sourceOnlyAttendances) {
      if (selectedEventIds.has(attendance.eventId)) continue;
      this.assertCanLeaveEvent(attendance);
    }

    const attendeeRoleUpdates: UserMergeTransfer['attendeeRoleUpdates'] = [];
    const secretSantaUserMoves: UserMergeTransfer['secretSantaUserMoves'] = [];

    for (const sourceAttendance of sourceFootprint.attendances) {
      const targetAttendance = targetAttendanceByEvent.get(sourceAttendance.eventId);
      if (!targetAttendance) continue;

      if (sourceAttendance.secretSantaUserId && targetAttendance.secretSantaUserId) {
        throw invalidMerge(
          `Both users take part in the secret santa of "${sourceAttendance.eventTitle}": remove one of them first`,
        );
      }

      if (ROLE_RANK[sourceAttendance.role] > ROLE_RANK[targetAttendance.role]) {
        attendeeRoleUpdates.push({ attendeeId: targetAttendance.attendeeId, role: sourceAttendance.role });
      }

      if (sourceAttendance.secretSantaUserId) {
        secretSantaUserMoves.push({
          secretSantaUserId: sourceAttendance.secretSantaUserId,
          attendeeId: targetAttendance.attendeeId,
        });
      }
    }

    const ownedWishlistIds: WishlistId[] = [];
    const coOwnedWishlistIds: WishlistId[] = [];

    for (const wishlistId of new Set(params.selectedWishlistIds)) {
      const wishlist = sourceFootprint.wishlists.find(w => w.id === wishlistId);

      if (!wishlist) {
        throw invalidMerge(`Wishlist ${wishlistId} does not belong to the merged user`);
      }

      if (wishlist.ownerId === source.id) {
        const leftEventId = wishlist.eventIds.find(
          eventId => sourceOnlyEventIds.has(eventId) && !selectedEventIds.has(eventId),
        );
        if (leftEventId) {
          throw invalidMerge(`Wishlist "${wishlist.title}" is linked to an event that is not transferred`);
        }
        ownedWishlistIds.push(wishlist.id);
        continue;
      }

      // The kept user already owns it: the co-ownership goes away with the merged user
      if (wishlist.ownerId !== target.id) {
        coOwnedWishlistIds.push(wishlist.id);
      }
    }

    return {
      attendeeIds: sourceOnlyAttendances.filter(a => selectedEventIds.has(a.eventId)).map(a => a.attendeeId),
      attendeeRoleUpdates,
      secretSantaUserMoves,
      ownedWishlistIds,
      coOwnedWishlistIds,
    };
  }

  private assertCanLeaveEvent(attendance: UserMergeAttendance): void {
    if (attendance.role === AttendeeRole.CREATOR) {
      throw invalidMerge(`The merged user created "${attendance.eventTitle}": the event must be transferred`);
    }

    if (attendance.secretSantaUserId) {
      throw invalidMerge(
        `The merged user takes part in the secret santa of "${attendance.eventTitle}": the event must be transferred`,
      );
    }
  }
}
