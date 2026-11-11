import type { AccessTokenJwtPayload, UserId, UserSessionId } from '@wishlist/common';
import type { Authorities } from '../../../user/domain/authorities.enum';
import type { UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import type { LoginOutput } from '../login.types';

import { getLogger, type StaticLogger } from '@znight/observability';

import { User } from '../../../user/domain/model/user.model';
import { UserSession } from '../../../user/domain/model/user-session.model';
import { type TokenService } from '../../infrastructure/token.service';
import { RefreshTokenManager } from '../../infrastructure/util/refresh-token';

export abstract class CommonLoginUseCase {
  protected readonly logger: StaticLogger;

  private readonly tokenService: TokenService;
  private readonly sessionRepository: UserSessionRepository;
  private readonly refreshTokenDuration: string;

  constructor(params: {
    tokenService: TokenService;
    loggerName: string;
    sessionRepository: UserSessionRepository;
    refreshTokenDuration: string;
  }) {
    this.logger = getLogger(params.loggerName);
    this.tokenService = params.tokenService;
    this.sessionRepository = params.sessionRepository;
    this.refreshTokenDuration = params.refreshTokenDuration;
  }

  private createAccessToken(params: {
    id: UserId;
    email: string;
    authorities: Authorities[];
    sessionId: UserSessionId;
  }): Promise<string> {
    const { id, email, authorities, sessionId } = params;
    this.logger.info('Creating access token...', { id, email, authorities, sessionId });
    const payload: AccessTokenJwtPayload = {
      sub: id,
      email,
      authorities,
      sid: sessionId,
    };

    return this.tokenService.sign(payload);
  }

  protected async issueTokens(params: { user: User; ip?: string; userAgent?: string }): Promise<LoginOutput> {
    const { user, ip, userAgent } = params;
    const rawRefreshToken = RefreshTokenManager.generateRaw();
    const session = UserSession.create({
      id: this.sessionRepository.newId(),
      userId: user.id,
      tokenHash: RefreshTokenManager.hash(rawRefreshToken),
      ip,
      userAgent,
      expiresAt: RefreshTokenManager.durationToDate(this.refreshTokenDuration),
    });

    await this.sessionRepository.save(session);

    return {
      accessToken: await this.createAccessToken({
        id: user.id,
        email: user.email,
        authorities: user.authorities,
        sessionId: session.id,
      }),
      refreshToken: rawRefreshToken,
    };
  }
}
