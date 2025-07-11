import type { AddEventAttendeeForEventInputDto, AttendeeDto } from '@wishlist/common'
import type { AxiosInstance } from 'axios'

export class AttendeeService {
  constructor(private readonly client: AxiosInstance) {}

  addAttendee(data: AddEventAttendeeForEventInputDto): Promise<AttendeeDto> {
    return this.client.post('/attendee', data).then(res => res.data)
  }

  async deleteAttendee(attendeeId: string): Promise<void> {
    await this.client.delete(`/attendee/${attendeeId}`)
  }
}
