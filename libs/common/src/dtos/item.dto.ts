import type { MiniUserDto } from './user.dto';

export class ItemTakerDto {
  declare user: MiniUserDto;
  declare taken_at: string;
}

export class ToggleItemOutputDto {
  declare takers: ItemTakerDto[];
}

export class ScanItemOutputDto {
  declare picture_url: string | null;
}
