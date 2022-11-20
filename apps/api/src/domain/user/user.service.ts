import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  ChangeUserPasswordInputDto,
  RegisterUserInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';
import { PasswordManager } from '../auth';
import { toDto } from './user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  findById(id: string): Promise<UserDto> {
    return this.userRepository.findOneByOrFail({ id }).then((entity) => toDto(entity));
  }

  // findByIds(ids: string[]): Promise<UserDto[]> {
  //   return this.userRepository.findBy({ id: In(ids) }).then((entities) => entities.map((entity) => toDto(entity)));
  // }

  findEntityByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async save(dto: RegisterUserInputDto): Promise<UserDto> {
    try {
      const entity = UserEntity.create({
        email: dto.email,
        firstName: dto.firstname,
        lastName: dto.lastname,
        passwordEnc: await PasswordManager.hash(dto.password),
      });

      return await this.userRepository.save(entity).then((e) => toDto(e));
    } catch (e) {
      throw new UnprocessableEntityException();
    }
  }

  async update(id: string, dto: UpdateUserProfileInputDto): Promise<void> {
    await this.userRepository.update(
      { id },
      {
        firstName: dto.firstname,
        lastName: dto.lastname,
        birthday: dto.birthday,
      }
    );
  }

  async changeUserPassword(id: string, dto: ChangeUserPasswordInputDto) {
    const entity = await this.userRepository.findOneByOrFail({ id });

    if (!(await PasswordManager.verify(entity.passwordEnc, dto.old_password))) {
      throw new BadRequestException("Old password don't match with user password");
    }

    const newPassword = await PasswordManager.hash(dto.new_password);

    await this.userRepository.update(
      { id },
      {
        passwordEnc: newPassword,
      }
    );
  }
}
