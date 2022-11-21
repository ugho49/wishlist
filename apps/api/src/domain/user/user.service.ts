import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';
import { PasswordManager } from '../auth';
import { toMiniUserDto, toUserDto } from './user.mapper';
import { isEmpty } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  findById(id: string): Promise<UserDto> {
    return this.userRepository.findOneByOrFail({ id }).then((entity) => toUserDto(entity));
  }

  findEntityByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(dto: RegisterUserInputDto): Promise<UserDto> {
    try {
      const entity = UserEntity.create({
        email: dto.email,
        firstName: dto.firstname,
        lastName: dto.lastname,
        passwordEnc: await PasswordManager.hash(dto.password),
      });

      return await this.userRepository.save(entity).then((e) => toUserDto(e));
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

  async searchByKeyword(id: string, criteria: string): Promise<MiniUserDto[]> {
    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const searchKey = criteria.trim().toLowerCase().normalize('NFC');

    const query = this.userRepository
      .createQueryBuilder('u')
      .where({ id: Not(id) })
      .andWhere(
        new Brackets((cb) =>
          cb
            .where('lower(u.firstName) like :search')
            .orWhere('lower(u.lastName) like :search')
            .orWhere('lower(u.email) like :search')
        )
      )
      .setParameter('search', `%${searchKey}%`)
      .limit(10)
      .orderBy('u.firstName', 'ASC');

    const list = await query.getMany();

    return list.map((entity) => toMiniUserDto(entity));
  }
}
