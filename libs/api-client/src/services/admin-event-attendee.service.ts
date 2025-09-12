import type { AxiosInstance } from 'axios'

export class AdminEventAttendeeService {
  constructor(private readonly client: AxiosInstance) {}

  async deleteAttendee(params: { eventId: string; attendeeId: string }): Promise<void> {
    await this.client.delete(`/admin/event/${params.eventId}/attendee/${params.attendeeId}`)
  }
}
