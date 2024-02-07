import {
  type AddItemForListInputDto,
  type AddItemInputDto,
  type ItemDto,
  type ScanItemInputDto,
  type ScanItemOutputDto,
  type ToggleItemOutputDto,
} from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class ItemService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  create(data: AddItemForListInputDto): Promise<ItemDto> {
    return this.getClient()
      .post('/item', data)
      .then((res) => res.data);
  }

  async update(itemId: string, data: AddItemInputDto): Promise<void> {
    await this.getClient().put(`/item/${itemId}`, data);
  }

  async delete(itemId: string): Promise<void> {
    await this.getClient().delete(`/item/${itemId}`);
  }

  async toggle(itemId: string): Promise<ToggleItemOutputDto> {
    return this.getClient()
      .post(`/item/${itemId}/toggle`)
      .then((res) => res.data);
  }

  async scanUrl(data: ScanItemInputDto): Promise<ScanItemOutputDto> {
    return this.getClient()
      .post('/item/scan-url', data)
      .then((res) => res.data);
  }
}
