import type {
  AddEventAttendeeInputDto,
  AttendeeDto,
  AttendeeId,
  EventId,
  UpdateEventAttendeeRoleInputDto,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'

export class EventAttendeeService {
  constructor(private readonly client: AxiosInstance) {}

  addAttendee(eventId: EventId, data: AddEventAttendeeInputDto): Promise<AttendeeDto> {
    return this.client.post(`/event/${eventId}/attendee`, data).then(res => res.data)
  }

  async updateAttendeeRole(params: {
    eventId: EventId
    attendeeId: AttendeeId
    data: UpdateEventAttendeeRoleInputDto
  }): Promise<void> {
    await this.client.put(`/event/${params.eventId}/attendee/${params.attendeeId}`, params.data)
  }

  async deleteAttendee(params: { eventId: EventId; attendeeId: AttendeeId }): Promise<void> {
    await this.client.delete(`/event/${params.eventId}/attendee/${params.attendeeId}`)
  }
}
