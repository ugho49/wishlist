import type { ICurrentUser } from '@wishlist/common';

import { NotFoundException } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { type AttendeeId, type EventId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import {
  type AddEventAttendeeInput,
  type AddEventAttendeeResult,
  type CreateEventInput,
  type CreateEventResult,
  type DeleteEventResult,
  AttendeeRole as GqlAttendeeRole,
  type RemoveEventAttendeeResult,
  type UpdateEventAttendeeRoleResult,
  type UpdateEventInput,
  type UpdateEventResult,
} from '../../../gql/generated-types';
import { AddAttendeeUseCase } from '../../application/command/add-attendee.use-case';
import { CreateEventUseCase } from '../../application/command/create-event.use-case';
import { DeleteAttendeeUseCase } from '../../application/command/delete-attendee.use-case';
import { DeleteEventUseCase } from '../../application/command/delete-event.use-case';
import { UpdateAttendeeRoleUseCase } from '../../application/command/update-attendee-role.use-case';
import { UpdateEventUseCase } from '../../application/command/update-event.use-case';
import { eventMapper } from '../event.mapper';
import {
  AddEventAttendeeInputSchema,
  AttendeeIdSchema,
  CreateEventInputSchema,
  EventIdSchema,
  GqlAttendeeRoleSchema,
  toDomainAttendeeRole,
  UpdateEventInputSchema,
} from '../event.schema';

@Resolver()
export class EventMutationResolver {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly addAttendeeUseCase: AddAttendeeUseCase,
    private readonly deleteAttendeeUseCase: DeleteAttendeeUseCase,
    private readonly updateAttendeeRoleUseCase: UpdateAttendeeRoleUseCase,
  ) {}

  @Mutation()
  async createEvent(
    @Args('input', new ZodPipe(CreateEventInputSchema)) input: CreateEventInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<CreateEventResult> {
    const createdEvent = await this.createEventUseCase.execute({
      currentUser,
      newEvent: {
        title: input.title,
        description: input.description ?? undefined,
        icon: input.icon ?? undefined,
        eventDate: new Date(input.eventDate),
        attendees: input.attendees?.map(attendee => ({
          email: attendee.email,
          role: toDomainAttendeeRole(attendee.role ?? undefined),
        })),
      },
    });

    // The create use-case returns a MiniEventDto; reload the full Event via the
    // dataloader so the resolver returns a complete Event object type.
    const loadedEvent = await ctx.loaders.event.load(createdEvent.id);
    if (!loadedEvent) {
      throw new NotFoundException(`Event with id ${createdEvent.id} not found`);
    }
    return loadedEvent;
  }

  @Mutation()
  async updateEvent(
    @Args('id', new ZodPipe(EventIdSchema)) id: EventId,
    @Args('input', new ZodPipe(UpdateEventInputSchema)) input: UpdateEventInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateEventResult> {
    await this.updateEventUseCase.execute({
      currentUser,
      eventId: id,
      updateEvent: {
        title: input.title,
        description: input.description ?? undefined,
        icon: input.icon ?? undefined,
        eventDate: new Date(input.eventDate),
      },
    });

    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async deleteEvent(
    @Args('id', new ZodPipe(EventIdSchema)) id: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteEventResult> {
    await this.deleteEventUseCase.execute({ currentUser, eventId: id });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async addEventAttendee(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @Args('input', new ZodPipe(AddEventAttendeeInputSchema)) input: AddEventAttendeeInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AddEventAttendeeResult> {
    const attendee = await this.addAttendeeUseCase.execute({
      currentUser,
      eventId,
      newAttendee: {
        email: input.email,
        role: toDomainAttendeeRole(input.role ?? undefined),
      },
    });

    return eventMapper.toGqlEventAttendeeFromDto(attendee);
  }

  @Mutation()
  async removeEventAttendee(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @Args('attendeeId', new ZodPipe(AttendeeIdSchema)) attendeeId: AttendeeId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<RemoveEventAttendeeResult> {
    await this.deleteAttendeeUseCase.execute({ currentUser, eventId, attendeeId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async updateEventAttendeeRole(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @Args('attendeeId', new ZodPipe(AttendeeIdSchema)) attendeeId: AttendeeId,
    @Args('role', new ZodPipe(GqlAttendeeRoleSchema)) role: GqlAttendeeRole,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateEventAttendeeRoleResult> {
    await this.updateAttendeeRoleUseCase.execute({
      currentUser,
      eventId,
      attendeeId,
      role: toDomainAttendeeRole(role),
    });
    return { __typename: 'VoidOutput', success: true };
  }
}
