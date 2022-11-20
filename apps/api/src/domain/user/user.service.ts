import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { RegisterUserDto, UserDto } from './user.dto';
import { PasswordManager } from '../auth';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  findById(id: string): Promise<UserDto> {
    return this.userRepository.findOneBy({ id }).then((entity) => entity.toDto());
  }

  findByIds(ids: string[]): Promise<UserDto[]> {
    return this.userRepository.findBy({ id: In(ids) }).then((entities) => entities.map((entity) => entity.toDto()));
  }

  findEntityByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async save(dto: RegisterUserDto): Promise<UserDto> {
    try {
      return await this.userRepository
        .save(
          UserEntity.create({
            email: dto.email,
            firstname: dto.firstname,
            lastname: dto.lastname,
            passwordEnc: await PasswordManager.hash(dto.password),
          })
        )
        .then((entity) => entity.toDto());
    } catch (e) {
      throw new UnprocessableEntityException();
    }
  }
}
