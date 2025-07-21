import {
  CreateItemUseCase,
  DeleteItemUseCase,
  NotifyNewItemsUseCase,
  ToggleItemUseCase,
  UpdateItemUseCase,
} from './command'
import { ScanItemUrlUseCase } from './query'

export const handlers = [
  ScanItemUrlUseCase,
  CreateItemUseCase,
  DeleteItemUseCase,
  ToggleItemUseCase,
  UpdateItemUseCase,
  NotifyNewItemsUseCase,
]
