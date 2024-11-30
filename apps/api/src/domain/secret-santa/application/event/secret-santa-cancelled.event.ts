import type { EventId } from '@wishlist/common-types'

export class SecretSantaCancelledEvent {
  public readonly eventTitle: string
  public readonly eventId: EventId
  public readonly attendeeEmails: string[]

  constructor(props: { eventTitle: string; eventId: EventId; attendeeEmails: string[] }) {
    this.eventId = props.eventId
    this.eventTitle = props.eventTitle
    this.attendeeEmails = props.attendeeEmails
  }
}
