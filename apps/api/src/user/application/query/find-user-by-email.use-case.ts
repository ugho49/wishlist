import type { RateLimiter, RateLimitRule } from '../../../core/rate-limit/rate-limiter';
import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { ONE_HOUR_IN_SECONDS, RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';

export type FindUserByEmailInput = {
  currentUser: ICurrentUser;
  /** Already lower-cased by the GraphQL schema */
  email: string;
  /** Client address, also rate limited: accounts are free to create */
  ip?: string;
};

export type FindUserByEmailOutput = {
  user?: User;
};

/**
 * Finds an account by its exact email, to show who is being invited. It tells whether an email has
 * an account and reveals its name, so every lookup is rate limited, per user and per client address.
 */
@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rateLimiter: RateLimiter,
    private readonly rateLimitConfig: RateLimitConfig,
  ) {}

  async execute(input: FindUserByEmailInput): Promise<FindUserByEmailOutput> {
    const { currentUser, email, ip } = input;

    await this.rateLimiter.consume(this.rateLimitRules(currentUser, ip));

    const user = await this.userRepository.findByEmail(email);

    if (!user?.isEnabled || user.id === currentUser.id) {
      return { user: undefined };
    }

    return { user };
  }

  private rateLimitRules(currentUser: ICurrentUser, ip: string | undefined): RateLimitRule[] {
    const rules: RateLimitRule[] = [
      {
        key: `user-by-email:user:${currentUser.id}`,
        limit: this.rateLimitConfig.userByEmailPerUser,
        windowSeconds: ONE_HOUR_IN_SECONDS,
      },
    ];

    if (ip) {
      rules.push({
        key: `user-by-email:ip:${ip}`,
        limit: this.rateLimitConfig.userByEmailPerIp,
        windowSeconds: ONE_HOUR_IN_SECONDS,
      });
    }

    return rules;
  }
}
