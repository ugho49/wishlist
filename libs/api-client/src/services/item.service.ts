import type {
  AddItemForListInputDto,
  ItemDto,
  ScanItemInputDto,
  ScanItemOutputDto,
  ToggleItemOutputDto,
  UpdateItemInputDto,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'

export class ItemService {
  constructor(private readonly client: AxiosInstance) {}

  create(data: AddItemForListInputDto): Promise<ItemDto> {
    return this.client.post('/item', data).then(res => res.data)
  }

  async update(itemId: string, data: UpdateItemInputDto): Promise<void> {
    await this.client.put(`/item/${itemId}`, data)
  }

  async delete(itemId: string): Promise<void> {
    await this.client.delete(`/item/${itemId}`)
  }

  async toggle(itemId: string): Promise<ToggleItemOutputDto> {
    return this.client.post(`/item/${itemId}/toggle`).then(res => res.data)
  }

  async scanUrl(data: ScanItemInputDto): Promise<ScanItemOutputDto> {
    return this.client.post('/item/scan-url', data).then(res => res.data)
  }
}
