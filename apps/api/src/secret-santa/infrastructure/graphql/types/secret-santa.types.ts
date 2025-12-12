import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { SecretSantaStatus } from '@wishlist/common'

import { AttendeeObject, MiniEventObject } from '../../../../event/infrastructure/graphql'

// Register enum for GraphQL
registerEnumType(SecretSantaStatus, {
  name: 'SecretSantaStatus',
  description: 'Status of a Secret Santa',
})

@ObjectType('SecretSantaUser')
export class SecretSantaUserObject {
  @Field(() => ID)
  id!: string

  @Field(() => AttendeeObject)
  attendee!: AttendeeObject

  @Field(() => [ID])
  exclusions!: string[]
}

@ObjectType('SecretSantaUserWithDraw')
export class SecretSantaUserWithDrawObject extends SecretSantaUserObject {
  @Field(() => AttendeeObject, { nullable: true })
  draw?: AttendeeObject
}

@ObjectType('SecretSanta')
export class SecretSantaObject {
  @Field(() => ID)
  id!: string

  @Field(() => MiniEventObject)
  event!: MiniEventObject

  @Field({ nullable: true })
  description?: string

  @Field(() => Float, { nullable: true })
  budget?: number

  @Field(() => SecretSantaStatus)
  status!: SecretSantaStatus

  @Field(() => [SecretSantaUserObject])
  users!: SecretSantaUserObject[]

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('AddSecretSantaUsersResult')
export class AddSecretSantaUsersResultObject {
  @Field(() => [SecretSantaUserObject])
  users!: SecretSantaUserObject[]
}
