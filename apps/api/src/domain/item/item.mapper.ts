import { ItemDto } from '@wishlist/common-types';
import { toMiniUserDto } from '../user/user.mapper';
import { ItemEntity } from './item.entity';

export async function toItemDto(entity: ItemEntity): Promise<ItemDto> {
  const user = entity.taker ? await entity.taker : null;

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    score: entity.score,
    url: entity.url,
    is_suggested: entity.isSuggested,
    taken_by: user && toMiniUserDto(user),
    taken_at: entity.takenAt?.toISOString(),
    created_at: entity.createdAt.toISOString(),
  };
}
