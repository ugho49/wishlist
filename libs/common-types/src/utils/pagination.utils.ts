import { PagedResponse } from '../dtos'

export function createPagedResponse<T>(params: {
  resources: T[]
  options: { pageSize: number; pageNumber?: number; totalElements: number }
}): PagedResponse<T> {
  const { options, resources } = params
  const { pageNumber, totalElements, pageSize } = options

  return {
    resources,
    pagination: {
      page_number: pageNumber || 0,
      total_elements: totalElements,
      total_pages: Math.ceil(totalElements / pageSize),
      pages_size: pageSize,
    },
  }
}
