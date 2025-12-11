import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { User, UserRepository } from '@wishlist/api/user'

import { LoginCommand, LoginResult } from '../../domain'
import { PasswordManager } from '../../infrastructure'
import { CommonLoginUseCase } from './common-login.use-case'

@CommandHandler(LoginCommand)
export class LoginUseCase extends CommonLoginUseCase implements IInferredCommandHandler<LoginCommand> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    jwtService: JwtService,
  ) {
    super({ jwtService, loggerName: LoginUseCase.name })
  }

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { email, password, ip } = command
    this.logger.log('Login request received', { email })

    const user = await this.validateUserByEmailPassword(email, password)

    const accessToken = this.createAccessToken(user)
    const updatedUser = user.updateLastConnection(ip)

    await this.userRepository.save(updatedUser)

    this.logger.log('Login successful', { email })

    return { access_token: accessToken }
  }

  private async validateUserByEmailPassword(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Incorrect login')
    }

    if (!user.isEnabled) {
      throw new UnauthorizedException('User is disabled')
    }

    const passwordVerified = await PasswordManager.verify({
      hash: user.passwordEnc || undefined,
      plainPassword: password,
    })

    if (!passwordVerified) {
      throw new UnauthorizedException('Incorrect login')
    }

    return user
  }
}
