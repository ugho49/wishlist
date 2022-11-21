import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { PasswordVerificationEntity } from './password-verification.entity';
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common-types';
import { randomString } from '@wishlist/common';
import { UserEntity, UserService } from '../user';
import { DateTime } from 'luxon';
import { ConfigType } from '@nestjs/config';
import { PasswordManager } from '../auth';
import passwordVerificationConfig from './password-verification.config';

@Injectable()
export class PasswordVerificationService {
  constructor(
    @InjectRepository(PasswordVerificationEntity)
    private readonly verificationEntityRepository: Repository<PasswordVerificationEntity>,
    private readonly userService: UserService,
    @Inject(passwordVerificationConfig.KEY)
    private readonly config: ConfigType<typeof passwordVerificationConfig>,
    private readonly dataSource: DataSource
  ) {}

  async sendResetEmail(dto: ResetPasswordInputDto) {
    const userEntity = await this.userService.findEntityByEmail(dto.email);

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

    await this.verificationEntityRepository.insert(entity);

    // TODO: sendResetPasswordMail(body.getEmail(), token);
  }

  async resetPassword(dto: ResetPasswordValidationInputDto) {
    const entity = await this.verificationEntityRepository.findOneByOrFail({
      token: dto.token,
      user: { email: dto.email },
    });

    if (DateTime.now() > DateTime.fromJSDate(entity.expiredAt)) {
      throw new UnauthorizedException('This reset code is not valid anymore');
    }

    await this.dataSource.transaction(async (em) => {
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
}
