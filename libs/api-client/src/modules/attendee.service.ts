import { type AddEventAttendeeForEventInputDto, type AttendeeDto } from '@wishlist/common-types';
import AxiosInstance from 'xior';

export class AttendeeService {
  constructor(private readonly client: AxiosInstance) {}

  addAttendee(data: AddEventAttendeeForEventInputDto): Promise<AttendeeDto> {
    return this.client.post('/attendee', data).then((res) => res.data);
  }

  async deleteAttendee(attendeeId: string): Promise<void> {
    await this.client.delete(`/attendee/${attendeeId}`);
  }
}
