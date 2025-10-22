import {
  CreateItemUseCase,
  DeleteItemUseCase,
  ImportItemsUseCase,
  NotifyNewItemsUseCase,
  ToggleItemUseCase,
  UpdateItemUseCase,
} from './command'
import { GetImportableItemsUseCase, ScanItemUrlUseCase } from './query'

export const handlers = [
  ScanItemUrlUseCase,
  GetImportableItemsUseCase,
  CreateItemUseCase,
  DeleteItemUseCase,
  ToggleItemUseCase,
  UpdateItemUseCase,
  NotifyNewItemsUseCase,
  ImportItemsUseCase,
]
