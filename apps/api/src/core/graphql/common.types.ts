import { Type } from '@nestjs/common'
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsPositive, Max, Min } from 'class-validator'

import { DEFAULT_RESULT_NUMBER } from '../common'

@InputType('PaginationFilters')
export class PaginationFilters {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @Min(1)
  declare page: number

  @Field(() => Int, { nullable: true, defaultValue: DEFAULT_RESULT_NUMBER })
  @IsPositive()
  @Max(200)
  declare limit: number
}

@ObjectType('Pagination')
export class GqlPagination {
  @Field(() => Int)
  declare totalPages: number

  @Field(() => Int)
  declare totalElements: number

  @Field(() => Int)
  declare pageNumber: number

  @Field(() => Int)
  declare pageSize: number
}

export function PagedResponse<T>(classRef: Type<T>): Type<{ resources: T[]; pagination: GqlPagination }> {
  @ObjectType({ isAbstract: true })
  abstract class PagedResponseClass {
    @Field(() => [classRef])
    declare resources: T[]

    @Field(() => GqlPagination)
    declare pagination: GqlPagination
  }
  return PagedResponseClass as Type<{ resources: T[]; pagination: GqlPagination }>
}
