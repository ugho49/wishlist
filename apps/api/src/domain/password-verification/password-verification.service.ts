import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { randomString } from '@wishlist/common'
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common-types'
import { DateTime } from 'luxon'
import { MoreThan } from 'typeorm'

import { PasswordManager } from '../auth'
import { UserEntity } from '../user'
import { UserRepository } from '../user/user.repository'
import passwordVerificationConfig from './password-verification.config'
import { PasswordVerificationEntity } from './password-verification.entity'
import { PasswordVerificationMailer } from './password-verification.mailer'
import { PasswordVerificationRepository } from './password-verification.repository'

@Injectable()
export class PasswordVerificationService {
  constructor(
    private readonly verificationEntityRepository: PasswordVerificationRepository,
    private readonly userRepository: UserRepository,
    @Inject(passwordVerificationConfig.KEY)
    private readonly config: ConfigType<typeof passwordVerificationConfig>,
    private readonly mailerService: PasswordVerificationMailer,
  ) {}

  async sendResetEmail(dto: ResetPasswordInputDto) {
    const userEntity = await this.userRepository.findByEmail(dto.email)

    if (!userEntity) {
      throw new NotFoundException('User not found')
    }

    const previousValidPasswordValidations = await this.verificationEntityRepository.findBy({
      userId: userEntity.id,
      expiredAt: MoreThan(new Date()),
    })

    if (previousValidPasswordValidations.length > 0) {
      throw new UnauthorizedException('A reset email has already been send, please retry later')
    }

    const token = randomString(20)
    const tokenExpireDate = DateTime.now().plus({ minute: this.config.resetPasswordTokenDurationInMinutes })

    const entity = PasswordVerificationEntity.create({
      user: userEntity.id,
      token: token,
      expiredAt: tokenExpireDate.toJSDate(),
    })

    await this.verificationEntityRepository.transaction(async em => {
      await em.insert(PasswordVerificationEntity, entity)

      await this.mailerService.sendResetEmail({
        email: dto.email,
        url: this.generateResetPasswordUrl({ email: userEntity.email, token }),
      })
    })
  }

  async resetPassword(dto: ResetPasswordValidationInputDto) {
    const entities = await this.verificationEntityRepository
      .createQueryBuilder('v')
      .innerJoinAndSelect('v.user', 'u')
      .where('u.email = :email', { email: dto.email })
      .getMany()

    if (entities.length === 0) {
      throw new NotFoundException('User not found')
    }

    const entity = entities.find(e => e.token === dto.token)

    if (!entity) {
      throw new UnauthorizedException('This reset code is not valid')
    }

    if (DateTime.now() > DateTime.fromJSDate(entity.expiredAt)) {
      throw new UnauthorizedException('This reset code is not valid anymore')
    }

    await this.verificationEntityRepository.transaction(async em => {
      await em.update(
        UserEntity,
        { id: entity.userId },
        {
          passwordEnc: await PasswordManager.hash(dto.new_password),
        },
      )
      await em.delete(PasswordVerificationEntity, { id: entity.id })
    })
  }

  private generateResetPasswordUrl(param: { email: string; token: string }) {
    const url = new URL(this.config.renewUrl)
    url.searchParams.append('email', param.email)
    url.searchParams.append('token', param.token)
    return url.toString()
  }
}
