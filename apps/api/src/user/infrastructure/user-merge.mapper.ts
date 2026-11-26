import type { UserId } from '@wishlist/common';
import type {
  GetUserMergePreviewOutput,
  UserMergeCandidate,
} from '../application/query/get-user-merge-preview.use-case';
import type { UserMergeAttendance, UserMergeWishlist } from '../domain/repository/user-merge.repository';

import { DateTime } from 'luxon';

import { eventMapper } from '../../event/infrastructure/event.mapper';
import {
  type AdminUserMergeCandidate as GqlAdminUserMergeCandidate,
  type AdminUserMergeEvent as GqlAdminUserMergeEvent,
  type AdminUserMergePreview as GqlAdminUserMergePreview,
  type AdminUserMergeWishlist as GqlAdminUserMergeWishlist,
} from '../../gql/generated-types';
import { userMapper } from './user.mapper';

function toGqlAdminUserMergeEvent(attendance: UserMergeAttendance): GqlAdminUserMergeEvent {
  return {
    __typename: 'AdminUserMergeEvent',
    id: attendance.eventId,
    title: attendance.eventTitle,
    icon: attendance.eventIcon,
    eventDate: DateTime.fromJSDate(attendance.eventDate).toISODate() ?? '',
    role: eventMapper.toGqlAttendeeRole(attendance.role),
    inSecretSanta: attendance.secretSantaUserId !== undefined,
  };
}

function toGqlAdminUserMergeWishlist(wishlist: UserMergeWishlist, userId: UserId): GqlAdminUserMergeWishlist {
  return {
    __typename: 'AdminUserMergeWishlist',
    id: wishlist.id,
    title: wishlist.title,
    logoUrl: wishlist.logoUrl,
    isCoOwner: wishlist.ownerId !== userId,
    eventIds: wishlist.eventIds,
    itemCount: wishlist.itemCount,
  };
}

function toGqlAdminUserMergeCandidate(candidate: UserMergeCandidate): GqlAdminUserMergeCandidate {
  return {
    __typename: 'AdminUserMergeCandidate',
    user: userMapper.toGqlUserFull(candidate.user),
    events: candidate.footprint.attendances.map(toGqlAdminUserMergeEvent),
    wishlists: candidate.footprint.wishlists.map(wishlist => toGqlAdminUserMergeWishlist(wishlist, candidate.user.id)),
    reservedItemCount: candidate.footprint.reservedItemCount,
  };
}

function toGqlAdminUserMergePreview(preview: GetUserMergePreviewOutput): GqlAdminUserMergePreview {
  return {
    __typename: 'AdminUserMergePreview',
    source: toGqlAdminUserMergeCandidate(preview.source),
    target: toGqlAdminUserMergeCandidate(preview.target),
  };
}

export const userMergeMapper = {
  toGqlAdminUserMergePreview,
};
