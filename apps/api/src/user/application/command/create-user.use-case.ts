import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserCreatedEvent } from '../../domain/event/user-created.event';
import { User } from '../../domain/model/user.model';

export type CreateUserInput = {
  newUser: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    birthday?: Date;
  };
  ip: string;
};

export type CreateUserOutput = {
  user: User;
};

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    this.logger.log('Create user request received', {
      payload: {
        newUser: {
          ...input.newUser,
          password: '********',
        },
        ip: input.ip,
      },
    });

    const { newUser, ip } = input;

    if (await this.userRepository.findByEmail(newUser.email)) {
      throw new UnauthorizedException('User email already taken');
    }

    const user = User.create({
      id: this.userRepository.newId(),
      email: newUser.email,
      firstName: newUser.firstname,
      lastName: newUser.lastname,
      birthday: newUser.birthday,
      passwordEnc: newUser.password ? await PasswordManager.hash(newUser.password) : undefined,
      ip,
    });

    this.logger.log('Creating user...', { userId: user.id });
    await this.userRepository.save(user);

    await this.eventBus.publish(new UserCreatedEvent({ user }));

    return { user };
  }
}
