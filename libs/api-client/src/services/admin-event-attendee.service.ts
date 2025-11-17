import type { AttendeeId, EventId } from '@wishlist/common'
import type { AxiosInstance } from 'axios'

export class AdminEventAttendeeService {
  constructor(private readonly client: AxiosInstance) {}

  async deleteAttendee(params: { eventId: EventId; attendeeId: AttendeeId }): Promise<void> {
    await this.client.delete(`/admin/event/${params.eventId}/attendee/${params.attendeeId}`)
  }
}
