import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { randomString, ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common'
import { DateTime } from 'luxon'
import { MoreThan } from 'typeorm'

import { PasswordManager } from '../../auth'
import { UserEntity } from '../infrastructure/legacy-user.entity'
import { LegacyPasswordVerificationRepository } from './legacy-password-verification-repository.service'
import { PasswordVerificationEntity } from './legacy-password-verification.entity'
import { LegacyUserRepository } from './legacy-user.repository'
import { PasswordVerificationMailer } from './password-verification.mailer'
import userConfig from './user.config'

@Injectable()
export class LegacyPasswordVerificationService {
  constructor(
    private readonly verificationEntityRepository: LegacyPasswordVerificationRepository,
    private readonly userRepository: LegacyUserRepository,
    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,
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
      throw new UnauthorizedException('This reset code is expired')
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
