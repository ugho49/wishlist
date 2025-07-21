import type { AddEventAttendeeInputDto, AttendeeDto } from '@wishlist/common'
import type { AxiosInstance } from 'axios'

export class EventAttendeeService {
  constructor(private readonly client: AxiosInstance) {}

  addAttendee(eventId: string, data: AddEventAttendeeInputDto): Promise<AttendeeDto> {
    return this.client.post(`/event/${eventId}/attendee`, data).then(res => res.data)
  }

  async deleteAttendee(params: { eventId: string; attendeeId: string }): Promise<void> {
    await this.client.delete(`/event/${params.eventId}/attendee/${params.attendeeId}`)
  }
}
