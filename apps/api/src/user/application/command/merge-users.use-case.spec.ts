import type { AttendeeId, EventId, SecretSantaUserId, WishlistId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type {
  UserMergeAttendance,
  UserMergeFootprint,
  UserMergeRepository,
  UserMergeWishlist,
} from '../../domain/repository/user-merge.repository';

import { uuid } from '@wishlist/common';
import { NotFoundException, UnauthorizedException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { AttendeeRole } from '../../../event/domain/attendee-role.enum';
import { User, type UserMergeProfileSelection } from '../../domain/model/user.model';
import { UserAccount } from '../../domain/model/user-account.model';
import { SignupSource } from '../../domain/signup-source.enum';
import { UserMergeSide } from '../../domain/user-merge-side.enum';
import { type MergeUsersInput, MergeUsersUseCase } from './merge-users.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

const KEEP_TARGET_PROFILE: UserMergeProfileSelection = {
  email: UserMergeSide.TARGET,
  firstName: UserMergeSide.TARGET,
  lastName: UserMergeSide.TARGET,
  birthday: UserMergeSide.TARGET,
  picture: UserMergeSide.TARGET,
};

const attendance = (overrides: Partial<UserMergeAttendance> & { eventId: EventId }): UserMergeAttendance => ({
  attendeeId: uuid() as AttendeeId,
  eventTitle: 'Noël',
  eventDate: new Date('2026-12-24'),
  role: AttendeeRole.PARTICIPANT,
  ...overrides,
});

const wishlist = (overrides: Partial<UserMergeWishlist> & Pick<UserMergeWishlist, 'ownerId'>): UserMergeWishlist => ({
  id: uuid() as WishlistId,
  title: 'Ma liste',
  eventIds: [],
  itemCount: 0,
  ...overrides,
});

const footprint = (overrides: Partial<UserMergeFootprint> = {}): UserMergeFootprint => ({
  attendances: [],
  wishlists: [],
  reservedItemCount: 0,
  ...overrides,
});

describe('MergeUsersUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const userMergeRepository = createMock<UserMergeRepository>();
  const transactionManager = createMock<TransactionManager>();
  const tx = {} as DrizzleTransaction;

  let useCase: MergeUsersUseCase;
  let admin: User;
  let source: User;
  let target: User;
  let sourceFootprint: UserMergeFootprint;
  let targetFootprint: UserMergeFootprint;
  let sourceAccounts: UserAccount[];
  let targetAccounts: UserAccount[];
  let targetPasswordAccount: UserAccount;
  let calls: string[];

  const input = (overrides: Partial<MergeUsersInput> = {}): MergeUsersInput => ({
    currentUser: toCurrentUser(admin),
    sourceUserId: source.id,
    targetUserId: target.id,
    profile: KEEP_TARGET_PROFILE,
    accountIds: [],
    eventIds: [],
    wishlistIds: [],
    transferReservations: false,
    ...overrides,
  });

  const transferArg = () => userMergeRepository.transfer.mock.calls[0]?.[0];

  beforeEach(() => {
    mock.clearAllMocks();
    calls = [];

    admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();
    source = new UserBuilder().withEmail('jean@gmail.com').withName({ firstName: 'Jeannot', lastName: 'D' }).build();
    target = new UserBuilder().withEmail('jean@work.fr').withName({ firstName: 'Jean', lastName: 'Dupont' }).build();
    sourceFootprint = footprint();
    targetFootprint = footprint();
    sourceAccounts = [
      new UserAccountBuilder().withGoogle('google-source').build(source),
      new UserAccountBuilder().buildPassword(source, 'source-hash'),
    ];
    targetPasswordAccount = new UserAccountBuilder().buildPassword(target, 'target-hash');
    targetAccounts = [targetPasswordAccount];

    userRepository.findByIdOrFail.mockImplementation(id => {
      if (id === source.id) return Promise.resolve(source);
      if (id === target.id) return Promise.resolve(target);
      return Promise.reject(new NotFoundException('User not found'));
    });
    userAccountRepository.findByUserId.mockImplementation(userId =>
      Promise.resolve(userId === source.id ? sourceAccounts : targetAccounts),
    );
    userMergeRepository.findFootprint.mockImplementation(userId =>
      Promise.resolve(userId === source.id ? sourceFootprint : targetFootprint),
    );
    const record = (call: string) => () => {
      calls.push(call);
      return Promise.resolve();
    };
    userMergeRepository.transfer.mockImplementation(record('transfer'));
    userRepository.delete.mockImplementation(record('delete'));
    userRepository.save.mockImplementation(record('save'));
    transactionManager.runInTransaction.mockImplementation(callback => callback(tx));

    useCase = new MergeUsersUseCase(userRepository, userAccountRepository, userMergeRepository, transactionManager);
  });

  describe('access', () => {
    it('should reject merging a user into itself', async () => {
      await expect(useCase.execute(input({ sourceUserId: target.id }))).rejects.toThrow(BusinessRuleException);
      expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    });

    it('should reject when the current admin is one of the users', async () => {
      await expect(useCase.execute(input({ currentUser: toCurrentUser(source) }))).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findByIdOrFail).not.toHaveBeenCalled();
    });

    it('should reject when a user does not exist', async () => {
      await expect(useCase.execute(input({ sourceUserId: uuid() as typeof source.id }))).rejects.toThrow(
        NotFoundException,
      );
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should reject when an admin merges another admin', async () => {
      source = new UserBuilder().asAdmin().build();

      await expect(useCase.execute(input())).rejects.toThrow(UnauthorizedException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should let a super-admin merge an admin', async () => {
      admin = new UserBuilder().asSuperAdmin().build();
      target = new UserBuilder().asAdmin().build();

      await useCase.execute(input());

      expect(userRepository.delete).toHaveBeenCalledWith(source.id, tx);
    });

    it('should reject a super-admin, even for a super-admin', async () => {
      admin = new UserBuilder().asSuperAdmin().build();
      source = new UserBuilder().asSuperAdmin().build();

      await expect(useCase.execute(input())).rejects.toThrow(UnauthorizedException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });
  });

  describe('accounts', () => {
    it('should reject an account the merged user does not own', async () => {
      await expect(useCase.execute(input({ accountIds: [targetPasswordAccount.id] }))).rejects.toThrow(
        BusinessRuleException,
      );
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should move the selected accounts and replace the target account of the same provider', async () => {
      const [googleAccount, passwordAccount] = sourceAccounts as [UserAccount, UserAccount];

      await useCase.execute(input({ accountIds: [googleAccount.id, passwordAccount.id, googleAccount.id] }));

      expect(transferArg()).toMatchObject({
        accountIds: [googleAccount.id, passwordAccount.id],
        replacedTargetAccountIds: [targetPasswordAccount.id],
      });
    });

    it('should keep the target accounts when no source account is selected', async () => {
      await useCase.execute(input());

      expect(transferArg()).toMatchObject({ accountIds: [], replacedTargetAccountIds: [] });
    });
  });

  describe('events', () => {
    const ownEventId = uuid() as EventId;
    const sharedEventId = uuid() as EventId;

    it('should reject an event that is not an event of the merged user only', async () => {
      sourceFootprint = footprint({ attendances: [attendance({ eventId: sharedEventId })] });
      targetFootprint = footprint({ attendances: [attendance({ eventId: sharedEventId })] });

      await expect(useCase.execute(input({ eventIds: [sharedEventId] }))).rejects.toThrow(BusinessRuleException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should reject leaving an event the merged user created', async () => {
      sourceFootprint = footprint({ attendances: [attendance({ eventId: ownEventId, role: AttendeeRole.CREATOR })] });

      await expect(useCase.execute(input())).rejects.toThrow(BusinessRuleException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should reject leaving an event where the merged user takes part in the secret santa', async () => {
      sourceFootprint = footprint({
        attendances: [attendance({ eventId: ownEventId, secretSantaUserId: uuid() as SecretSantaUserId })],
      });

      await expect(useCase.execute(input())).rejects.toThrow(BusinessRuleException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should move the selected attendances and leave the others behind', async () => {
      const kept = attendance({ eventId: ownEventId, role: AttendeeRole.CREATOR });
      const left = attendance({ eventId: uuid() as EventId });
      sourceFootprint = footprint({ attendances: [kept, left] });

      await useCase.execute(input({ eventIds: [ownEventId] }));

      expect(transferArg()).toMatchObject({ attendeeIds: [kept.attendeeId] });
    });

    it('should give the target the higher role of a shared event', async () => {
      const targetAttendance = attendance({ eventId: sharedEventId, role: AttendeeRole.PARTICIPANT });
      sourceFootprint = footprint({
        attendances: [attendance({ eventId: sharedEventId, role: AttendeeRole.CREATOR })],
      });
      targetFootprint = footprint({ attendances: [targetAttendance] });

      await useCase.execute(input());

      expect(transferArg()).toMatchObject({
        attendeeIds: [],
        attendeeRoleUpdates: [{ attendeeId: targetAttendance.attendeeId, role: AttendeeRole.CREATOR }],
      });
    });

    it('should not lower the target role of a shared event', async () => {
      sourceFootprint = footprint({ attendances: [attendance({ eventId: sharedEventId })] });
      targetFootprint = footprint({ attendances: [attendance({ eventId: sharedEventId, role: AttendeeRole.ADMIN })] });

      await useCase.execute(input());

      expect(transferArg()).toMatchObject({ attendeeRoleUpdates: [] });
    });

    it('should move the secret santa participation onto the target attendance of a shared event', async () => {
      const secretSantaUserId = uuid() as SecretSantaUserId;
      const targetAttendance = attendance({ eventId: sharedEventId });
      sourceFootprint = footprint({ attendances: [attendance({ eventId: sharedEventId, secretSantaUserId })] });
      targetFootprint = footprint({ attendances: [targetAttendance] });

      await useCase.execute(input());

      expect(transferArg()).toMatchObject({
        secretSantaUserMoves: [{ secretSantaUserId, attendeeId: targetAttendance.attendeeId }],
      });
    });

    it('should reject a shared event where both users take part in the secret santa', async () => {
      sourceFootprint = footprint({
        attendances: [attendance({ eventId: sharedEventId, secretSantaUserId: uuid() as SecretSantaUserId })],
      });
      targetFootprint = footprint({
        attendances: [attendance({ eventId: sharedEventId, secretSantaUserId: uuid() as SecretSantaUserId })],
      });

      await expect(useCase.execute(input())).rejects.toThrow(BusinessRuleException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });
  });

  describe('wishlists', () => {
    const ownEventId = uuid() as EventId;
    const sharedEventId = uuid() as EventId;

    beforeEach(() => {
      sourceFootprint = footprint({
        attendances: [attendance({ eventId: ownEventId }), attendance({ eventId: sharedEventId })],
      });
      targetFootprint = footprint({ attendances: [attendance({ eventId: sharedEventId })] });
    });

    it('should reject a wishlist the merged user does not own or co-own', async () => {
      await expect(useCase.execute(input({ wishlistIds: [uuid() as WishlistId] }))).rejects.toThrow(
        BusinessRuleException,
      );
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should reject an owned wishlist linked to an event that is not transferred', async () => {
      const owned = wishlist({ ownerId: source.id, eventIds: [ownEventId] });
      sourceFootprint = { ...sourceFootprint, wishlists: [owned] };

      await expect(useCase.execute(input({ wishlistIds: [owned.id] }))).rejects.toThrow(BusinessRuleException);
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should transfer an owned wishlist linked to transferred or shared events', async () => {
      const owned = wishlist({ ownerId: source.id, eventIds: [ownEventId, sharedEventId] });
      sourceFootprint = { ...sourceFootprint, wishlists: [owned] };

      await useCase.execute(input({ eventIds: [ownEventId], wishlistIds: [owned.id] }));

      expect(transferArg()).toMatchObject({ ownedWishlistIds: [owned.id], coOwnedWishlistIds: [] });
    });

    it('should transfer a co-owned wishlist, whatever its events', async () => {
      const coOwned = wishlist({ ownerId: admin.id, coOwnerId: source.id, eventIds: [ownEventId] });
      sourceFootprint = { ...sourceFootprint, wishlists: [coOwned] };

      await useCase.execute(input({ wishlistIds: [coOwned.id] }));

      expect(transferArg()).toMatchObject({ ownedWishlistIds: [], coOwnedWishlistIds: [coOwned.id] });
    });

    it('should skip a co-owned wishlist the target already owns', async () => {
      const ownedByTarget = wishlist({ ownerId: target.id, coOwnerId: source.id });
      sourceFootprint = { ...sourceFootprint, wishlists: [ownedByTarget] };

      await useCase.execute(input({ wishlistIds: [ownedByTarget.id] }));

      expect(transferArg()).toMatchObject({ ownedWishlistIds: [], coOwnedWishlistIds: [] });
    });
  });

  describe('merge', () => {
    it('should transfer, delete the merged user, then save the kept one in a single transaction', async () => {
      await useCase.execute(input({ transferReservations: true }));

      expect(calls).toEqual(['transfer', 'delete', 'save']);
      expect(userMergeRepository.transfer).toHaveBeenCalledWith(
        expect.objectContaining({ sourceUserId: source.id, targetUserId: target.id, transferReservations: true }),
        tx,
      );
      expect(userRepository.delete).toHaveBeenCalledWith(source.id, tx);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: target.id }), tx);
    });

    it('should keep the picked profile fields and the target identity', async () => {
      source = new User({
        ...source,
        birthday: new Date('1990-05-01'),
        pictureUrl: 'https://cdn/source.webp',
        signupSource: SignupSource.OTHER,
        signupSourceDetail: 'Un ami',
      });

      const { user } = await useCase.execute(
        input({
          profile: {
            email: UserMergeSide.SOURCE,
            firstName: UserMergeSide.TARGET,
            lastName: UserMergeSide.SOURCE,
            birthday: UserMergeSide.SOURCE,
            picture: UserMergeSide.SOURCE,
          },
        }),
      );

      expect(user).toMatchObject({
        id: target.id,
        email: 'jean@gmail.com',
        firstName: 'Jean',
        lastName: 'D',
        birthday: new Date('1990-05-01'),
        pictureUrl: 'https://cdn/source.webp',
        authorities: target.authorities,
        isEnabled: target.isEnabled,
        signupSource: SignupSource.OTHER,
        signupSourceDetail: 'Un ami',
      });
      expect(userRepository.save).toHaveBeenCalledWith(user, tx);
    });

    it('should keep the target signup source when it has one', async () => {
      target = new User({ ...target, signupSource: SignupSource.GOOGLE });
      source = new User({ ...source, signupSource: SignupSource.OTHER, signupSourceDetail: 'Un ami' });

      const { user } = await useCase.execute(input());

      expect(user.signupSource).toBe(SignupSource.GOOGLE);
      expect(user.signupSourceDetail).toBeUndefined();
    });
  });
});
