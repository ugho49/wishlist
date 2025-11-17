import type {
  AddItemForListInputDto,
  GetImportableItemsInputDto,
  ImportItemsInputDto,
  ItemDto,
  ItemId,
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

  async update(itemId: ItemId, data: UpdateItemInputDto): Promise<void> {
    await this.client.put(`/item/${itemId}`, data)
  }

  async delete(itemId: ItemId): Promise<void> {
    await this.client.delete(`/item/${itemId}`)
  }

  toggle(itemId: ItemId): Promise<ToggleItemOutputDto> {
    return this.client.post(`/item/${itemId}/toggle`).then(res => res.data)
  }

  scanUrl(data: ScanItemInputDto): Promise<ScanItemOutputDto> {
    return this.client.post('/item/scan-url', data).then(res => res.data)
  }

  getImportableItems(params: GetImportableItemsInputDto): Promise<ItemDto[]> {
    return this.client.get('/item/importable', { params }).then(res => res.data)
  }

  importItems(data: ImportItemsInputDto): Promise<ItemDto[]> {
    return this.client.post('/item/import', data).then(res => res.data)
  }
}
