import type { UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { User } from '../model/user.model';

export interface UserRepository {
  newId(): UserId;
  findById(id: UserId): Promise<User | undefined>;
  findByIds(userIds: UserId[]): Promise<User[]>;
  findByIdOrFail(id: UserId): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findByEmails(emails: string[]): Promise<User[]>;
  /** Users of the user's circle (see circle.sql.ts) whose name or email contains the keyword. */
  searchInCircle(params: { userId: UserId; keyword: string; limit: number }): Promise<User[]>;
  findAllPaginated(params: {
    criteria?: string;
    pagination: { take: number; skip: number };
  }): Promise<{ users: User[]; totalCount: number }>;
  countAdminStats(): Promise<{ totalCount: number; enabledCount: number; adminCount: number }>;
  countCreatedByMonth(since: Date): Promise<Array<{ month: string; count: number }>>;
  /** Users of the user's circle, the ones sharing the most events with them first. */
  findClosestFriends(userId: UserId, limit: number): Promise<User[]>;
  findEnabledWithBirthdayOn(params: { month: number; day: number; includeLeapDay: boolean }): Promise<User[]>;
  save(user: User, tx?: DrizzleTransaction): Promise<void>;
  delete(userId: UserId, tx?: DrizzleTransaction): Promise<void>;
}
