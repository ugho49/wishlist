import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserCreatedEvent } from '../../domain/event/user-created.event';
import { User } from '../../domain/model/user.model';
import { UserAccount } from '../../domain/model/user-account.model';

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
    @Inject(REPOSITORIES.USER_ACCOUNT)
    private readonly userAccountRepository: UserAccountRepository,
    private readonly transactionManager: TransactionManager,
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
      ip,
    });

    const passwordAccount = UserAccount.createPassword({
      id: this.userAccountRepository.newId(),
      user,
      email: user.email,
      passwordHash: await PasswordManager.hash(newUser.password),
    });

    this.logger.log('Creating user...', { userId: user.id });
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx);
      await this.userAccountRepository.save(passwordAccount, tx);
    });

    await this.eventBus.publish(new UserCreatedEvent({ user }));

    return { user };
  }
}
