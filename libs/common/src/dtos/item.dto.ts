import type { ItemId } from '../ids';
import type { MiniUserDto } from './user.dto';

export class ItemTakerDto {
  declare user: MiniUserDto;
  declare taken_at: string;
}

export class ItemDto {
  declare id: ItemId;
  declare name: string;
  declare description?: string;
  declare url?: string;
  declare score?: number;
  declare is_suggested?: boolean;
  declare picture_url?: string;
  declare takers?: ItemTakerDto[];
  declare created_at: string;
}

export class ToggleItemOutputDto {
  declare takers: ItemTakerDto[];
}

export class ScanItemOutputDto {
  declare picture_url: string | null;
}
