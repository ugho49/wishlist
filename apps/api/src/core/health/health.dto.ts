import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum HealthStatus {
  ERROR = 'error',
  OK = 'ok',
  SHUTTING_DOWN = 'shutting_down',
}

registerEnumType(HealthStatus, { name: 'HealthStatus' })

@ObjectType()
export class HealthDto {
  @Field(() => HealthStatus)
  declare status: HealthStatus
}
