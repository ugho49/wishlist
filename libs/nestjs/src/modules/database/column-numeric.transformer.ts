export class ColumnNumericTransformer {
  to(data: number | null | undefined): number | null | undefined {
    return data
  }
  from(data: string | null | undefined): number | null | undefined {
    return data !== undefined && data !== null ? parseFloat(data) : data
  }
}
