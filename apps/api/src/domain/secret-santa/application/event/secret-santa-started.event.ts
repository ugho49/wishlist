import type { EventId } from '@wishlist/common'

type Drawn = {
  email: string
  secretSantaName: string
}

export class SecretSantaStartedEvent {
  public readonly eventTitle: string
  public readonly eventId: EventId
  public readonly description?: string
  public readonly budget?: number
  public readonly drawns: Drawn[]

  constructor(props: { eventTitle: string; eventId: EventId; description?: string; budget?: number; drawns: Drawn[] }) {
    this.eventId = props.eventId
    this.eventTitle = props.eventTitle
    this.description = props.description
    this.budget = props.budget
    this.drawns = props.drawns
  }
}
