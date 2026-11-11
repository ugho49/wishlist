import type { LoginOutput } from '../login.types';

import { type AccessTokenJwtPayload } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { type UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import { AuthConfig } from '../../infrastructure/auth.config';
import { TokenService } from '../../infrastructure/token.service';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export type RefreshSessionInput = {
  refreshToken: string;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class RefreshSessionUseCase {
  private readonly logger = getLogger(RefreshSessionUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
    private readonly config: AuthConfig,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RefreshSessionInput): Promise<LoginOutput> {
    this.logger.info('Refresh session request received');

    const session = await this.sessionRepository.findByTokenHash(RefreshTokenManager.hash(input.refreshToken));

    if (!session?.isActive()) {
      throw new UnauthorizedException('Incorrect login');
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user?.isEnabled) {
      throw new UnauthorizedException('Incorrect login');
    }

    const rawRefreshToken = RefreshTokenManager.generateRaw();
    const rotatedSession = session.rotate({
      tokenHash: RefreshTokenManager.hash(rawRefreshToken),
      expiresAt: RefreshTokenManager.durationToDate(this.config.refreshTokenDuration),
      ip: input.ip,
    });
    await this.sessionRepository.save(rotatedSession);

    const payload: AccessTokenJwtPayload = {
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
      sid: session.id,
    };

    this.logger.info('Session refreshed', { userId: user.id, sessionId: session.id });

    return {
      accessToken: await this.tokenService.sign(payload),
      refreshToken: rawRefreshToken,
    };
  }
}
