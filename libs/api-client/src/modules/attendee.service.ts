import { type AddEventAttendeeForEventInputDto, type AttendeeDto } from '@wishlist/common-types';
import { ServiceConstructor } from '../modules.type';

export class AttendeeService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  addAttendee(data: AddEventAttendeeForEventInputDto): Promise<AttendeeDto> {
    return this.getClient()
      .post('/attendee', data)
      .then((res) => res.data);
  }

  async deleteAttendee(attendeeId: string): Promise<void> {
    await this.getClient().delete(`/attendee/${attendeeId}`);
  }
}
