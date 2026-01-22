import { CreateItemUseCase } from './command/create-item.use-case'
import { DeleteItemUseCase } from './command/delete-item.use-case'
import { ImportItemsUseCase } from './command/import-items.use-case'
import { NotifyNewItemsUseCase } from './command/notify-new-items.use-case'
import { ToggleItemUseCase } from './command/toggle-item.use-case'
import { UpdateItemUseCase } from './command/update-item.use-case'
import { GetImportableItemsUseCase } from './query/get-importable-items.use-case'
import { ScanItemUrlUseCase } from './query/scan-item-url.use-case'

export const handlers = [
  // Queries
  GetImportableItemsUseCase,
  ScanItemUrlUseCase,
  // Commands
  CreateItemUseCase,
  DeleteItemUseCase,
  ToggleItemUseCase,
  UpdateItemUseCase,
  NotifyNewItemsUseCase,
  ImportItemsUseCase,
]
