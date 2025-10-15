import type { PipeTransform } from '@nestjs/common'

export class ParseJsonPipe implements PipeTransform {
  transform(value: string) {
    return JSON.parse(value)
  }
}
