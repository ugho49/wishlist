import { PipeTransform } from '@nestjs/common';

export class ParseJsonPipe implements PipeTransform {
  transform(value: any) {
    return JSON.parse(value);
  }
}
