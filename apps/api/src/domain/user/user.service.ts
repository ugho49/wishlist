import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { RegisterUserInputDto, UserDto } from '@wishlist/common-types';
import { PasswordManager } from '../auth';
import { toDto } from './user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  findById(id: string): Promise<UserDto> {
    return this.userRepository.findOneBy({ id }).then((entity) => toDto(entity));
  }

  findByIds(ids: string[]): Promise<UserDto[]> {
    return this.userRepository.findBy({ id: In(ids) }).then((entities) => entities.map((entity) => toDto(entity)));
  }

  findEntityByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async save(dto: RegisterUserInputDto): Promise<UserDto> {
    try {
      return await this.userRepository
        .save(
          UserEntity.create({
            email: dto.email,
            firstName: dto.firstname,
            lastName: dto.lastname,
            passwordEnc: await PasswordManager.hash(dto.password),
          })
        )
        .then((entity) => toDto(entity));
    } catch (e) {
      throw new UnprocessableEntityException();
    }
  }
}
