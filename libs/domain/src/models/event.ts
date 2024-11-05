import { Brand, uuid } from '@wishlist/common'

export type EventId = Brand<string, 'EventId'>

export class Event {
  public readonly id: EventId
  public readonly title: string
  public readonly description?: string
  public readonly eventDate: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: EventId
    title: string
    description?: string
    eventDate: Date
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.eventDate = props.eventDate
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static getNewId(): EventId {
    return uuid() as EventId
  }
}
