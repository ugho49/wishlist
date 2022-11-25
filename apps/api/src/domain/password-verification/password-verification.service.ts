import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MoreThan } from 'typeorm';
import { PasswordVerificationEntity } from './password-verification.entity';
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common-types';
import { randomString } from '@wishlist/common';
import { UserEntity } from '../user';
import { DateTime } from 'luxon';
import { ConfigType } from '@nestjs/config';
import { PasswordManager } from '../auth';
import passwordVerificationConfig from './password-verification.config';
import { PasswordVerificationRepository } from './password-verification.repository';
import { UserRepository } from '../user/user.repository';
import { PasswordVerificationMailer } from './password-verification.mailer';

@Injectable()
export class PasswordVerificationService {
  constructor(
    private readonly verificationEntityRepository: PasswordVerificationRepository,
    private readonly userRepository: UserRepository,
    @Inject(passwordVerificationConfig.KEY)
    private readonly config: ConfigType<typeof passwordVerificationConfig>,
    private readonly mailerService: PasswordVerificationMailer
  ) {}

  async sendResetEmail(dto: ResetPasswordInputDto) {
    const userEntity = await this.userRepository.findByEmail(dto.email);

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const previousValidPasswordValidations = await this.verificationEntityRepository.findBy({
      userId: userEntity.id,
      expiredAt: MoreThan(new Date()),
    });

    if (previousValidPasswordValidations.length > 0) {
      throw new UnauthorizedException('A reset email has already been send, please retry later');
    }

    const token = randomString(20);
    const tokenExpireDate = DateTime.now().plus({ minute: this.config.resetPasswordTokenDurationInMinutes });

    const entity = PasswordVerificationEntity.create({
      user: userEntity.id,
      token: token,
      expiredAt: tokenExpireDate.toJSDate(),
    });

    await this.verificationEntityRepository.transaction(async (em) => {
      await em.insert(PasswordVerificationEntity, entity);

      await this.mailerService.sendResetEmail({
        email: dto.email,
        url: this.generateResetPasswordUrl({ email: userEntity.email, token }),
      });
    });
  }

  async resetPassword(dto: ResetPasswordValidationInputDto) {
    const entity = await this.verificationEntityRepository
      .createQueryBuilder('v')
      .innerJoinAndSelect('v.user', 'u')
      .where('v.token = :token', { token: dto.token })
      .andWhere('u.email = :email', { email: dto.email })
      .getOneOrFail();

    if (DateTime.now() > DateTime.fromJSDate(entity.expiredAt)) {
      throw new UnauthorizedException('This reset code is not valid anymore');
    }

    await this.verificationEntityRepository.transaction(async (em) => {
      await em.update(
        UserEntity,
        { id: entity.userId },
        {
          passwordEnc: await PasswordManager.hash(dto.new_password),
        }
      );
      await em.delete(PasswordVerificationEntity, { id: entity.id });
    });
  }

  private generateResetPasswordUrl(param: { email: string; token: string }) {
    const url = new URL(this.config.renewUrl);
    url.searchParams.append('email', param.email);
    url.searchParams.append('token', param.token);
    return url.toString();
  }
}
