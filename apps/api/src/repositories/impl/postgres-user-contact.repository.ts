import type { DrizzleDatabase } from '../../core/database/database.factory';
import type { User } from '../../user/domain/model/user.model';

import { schema } from '@wishlist/api-drizzle';
import { type UserContactId, type UserId, uuid } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { and, asc, count, eq, inArray } from 'drizzle-orm';

import { UserContact } from '../../user/domain/model/user-contact.model';
import { type Friend, type UserContactRepository } from '../../user/domain/repository/user-contact.repository';
import { UserContactStatus } from '../../user/domain/user-contact-status.enum';
import { eventIdsOf, inCircleOf } from './circle.sql';
import { PostgresUserRepository } from './postgres-user.repository';

@Injectable()
export class PostgresUserContactRepository implements UserContactRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  newId(): UserContactId {
    return uuid() as UserContactId;
  }

  async findByOwnerAndContact(ownerUserId: UserId, contactUserId: UserId): Promise<UserContact | undefined> {
    const row = await this.db.query.userContact.findFirst({
      where: and(eq(schema.userContact.ownerUserId, ownerUserId), eq(schema.userContact.contactUserId, contactUserId)),
    });
    return row ? PostgresUserContactRepository.toModel(row) : undefined;
  }

  async save(contact: UserContact): Promise<void> {
    await this.db
      .insert(schema.userContact)
      .values({
        id: contact.id,
        ownerUserId: contact.ownerUserId,
        contactUserId: contact.contactUserId,
        status: contact.status,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })
      .onConflictDoUpdate({
        target: [schema.userContact.ownerUserId, schema.userContact.contactUserId],
        set: { status: contact.status, updatedAt: contact.updatedAt },
      });
  }

  async findFriends(userId: UserId): Promise<Friend[]> {
    const rows = await this.db
      .select({
        user: schema.user,
        status: schema.userContact.status,
        sharedEventsCount: count(schema.eventAttendee.id),
      })
      .from(schema.user)
      .leftJoin(
        schema.eventAttendee,
        and(
          eq(schema.eventAttendee.userId, schema.user.id),
          inArray(schema.eventAttendee.eventId, eventIdsOf(this.db, userId)),
        ),
      )
      .leftJoin(
        schema.userContact,
        and(eq(schema.userContact.ownerUserId, userId), eq(schema.userContact.contactUserId, schema.user.id)),
      )
      .where(inCircleOf(this.db, userId))
      .groupBy(schema.user.id, schema.userContact.status)
      .orderBy(asc(schema.user.firstName), asc(schema.user.lastName));

    return rows.map(row => ({
      user: PostgresUserRepository.toModel(row.user),
      added: row.status === UserContactStatus.ADDED,
      sharedEventsCount: row.sharedEventsCount,
    }));
  }

  async findHiddenUsers(userId: UserId): Promise<User[]> {
    const rows = await this.db
      .select({ user: schema.user })
      .from(schema.userContact)
      .innerJoin(schema.user, eq(schema.user.id, schema.userContact.contactUserId))
      .where(
        and(
          eq(schema.userContact.ownerUserId, userId),
          eq(schema.userContact.status, UserContactStatus.HIDDEN),
          eq(schema.user.isEnabled, true),
        ),
      )
      .orderBy(asc(schema.user.firstName), asc(schema.user.lastName));

    return rows.map(row => PostgresUserRepository.toModel(row.user));
  }

  async isInCircle(userId: UserId, otherUserId: UserId): Promise<boolean> {
    const rows = await this.db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(and(eq(schema.user.id, otherUserId), inCircleOf(this.db, userId)))
      .limit(1);

    return rows.length > 0;
  }

  static toModel(row: typeof schema.userContact.$inferSelect): UserContact {
    return new UserContact({
      id: row.id,
      ownerUserId: row.ownerUserId,
      contactUserId: row.contactUserId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
