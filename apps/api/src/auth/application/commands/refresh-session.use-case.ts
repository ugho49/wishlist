import type { ConfigType } from '@nestjs/config';
import type { LoginOutput } from '../login.types';

import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type AccessTokenJwtPayload } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { type UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import authConfig from '../../infrastructure/auth.config';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export type RefreshSessionInput = {
  refreshToken: string;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class RefreshSessionUseCase {
  private readonly logger = new Logger(RefreshSessionUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RefreshSessionInput): Promise<LoginOutput> {
    this.logger.log('Refresh session request received');

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
      expiresAt: RefreshTokenManager.durationToDate(this.config.refreshToken.duration),
      ip: input.ip,
    });
    await this.sessionRepository.save(rotatedSession);

    const payload: AccessTokenJwtPayload = {
      sub: user.id,
      email: user.email,
      authorities: user.authorities,
      sid: session.id,
    };

    this.logger.log('Session refreshed', { userId: user.id, sessionId: session.id });

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: rawRefreshToken,
    };
  }
}
