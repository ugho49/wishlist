import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPasswordVerificationEntity } from '../entities/user-password-verification.entity';
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common-types';

@Injectable()
export class UserPasswordVerificationService {
  constructor(
    @InjectRepository(UserPasswordVerificationEntity)
    private readonly verificationEntityRepository: Repository<UserPasswordVerificationEntity>
  ) {}

  sendResetEmail(dto: ResetPasswordInputDto) {
    console.log(dto); // TODO
  }

  resetPassword(dto: ResetPasswordValidationInputDto) {
    console.log(dto); // TODO
  }
}
