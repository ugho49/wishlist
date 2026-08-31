import type { AccessTokenJwtPayload, UserId, UserRefreshTokenId } from '@wishlist/common';
import type { Authorities } from '../../../user/domain/authorities.enum';
import type { UserRefreshTokenRepository } from '../../../user/domain/repository/user-refresh-token.repository';
import type { LoginOutput } from '../login.types';

import { Logger } from '@nestjs/common';
import { type JwtService } from '@nestjs/jwt';

import { User } from '../../../user/domain/model/user.model';
import { UserRefreshToken } from '../../../user/domain/model/user-refresh-token.model';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export abstract class CommonLoginUseCase {
  protected readonly logger: Logger;

  private readonly jwtService: JwtService;
  private readonly refreshTokenRepository: UserRefreshTokenRepository;
  private readonly refreshTokenDuration: string;

  constructor(params: {
    jwtService: JwtService;
    loggerName: string;
    refreshTokenRepository: UserRefreshTokenRepository;
    refreshTokenDuration: string;
  }) {
    this.logger = new Logger(params.loggerName);
    this.jwtService = params.jwtService;
    this.refreshTokenRepository = params.refreshTokenRepository;
    this.refreshTokenDuration = params.refreshTokenDuration;
  }

  private createAccessToken(params: {
    id: UserId;
    email: string;
    authorities: Authorities[];
    sessionId: UserRefreshTokenId;
  }): string {
    const { id, email, authorities, sessionId } = params;
    this.logger.log('Creating access token...', { id, email, authorities, sessionId });
    const payload: AccessTokenJwtPayload = {
      sub: id,
      email,
      authorities,
      sid: sessionId,
    };

    return this.jwtService.sign(payload);
  }

  protected async issueTokens(params: { user: User; ip: string; userAgent?: string }): Promise<LoginOutput> {
    const { user, ip, userAgent } = params;
    const rawRefreshToken = RefreshTokenManager.generateRaw();
    const session = UserRefreshToken.create({
      id: this.refreshTokenRepository.newId(),
      userId: user.id,
      tokenHash: RefreshTokenManager.hash(rawRefreshToken),
      ip,
      userAgent,
      expiresAt: RefreshTokenManager.durationToDate(this.refreshTokenDuration),
    });

    await this.refreshTokenRepository.save(session);

    return {
      accessToken: this.createAccessToken({
        id: user.id,
        email: user.email,
        authorities: user.authorities,
        sessionId: session.id,
      }),
      refreshToken: rawRefreshToken,
    };
  }
}
