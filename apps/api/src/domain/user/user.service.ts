import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  PagedResponse,
  RegisterUserInputDto,
  UpdateFullUserProfileInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';
import { PasswordManager } from '../auth';
import { toMiniUserDto, toUserDto } from './user.mapper';
import { isEmpty } from 'lodash';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';

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
      .andWhere(this.findByNameOrEmail())
      .setParameter('search', `%${searchKey}%`)
      .limit(10)
      .orderBy('u.firstName', 'ASC');

    const list = await query.getMany();

    return list.map((entity) => toMiniUserDto(entity));
  }

  async findAllByCriteriaPaginated(props: { pageNumber?: number; criteria?: string }): Promise<PagedResponse<UserDto>> {
    const { criteria, pageNumber } = props;
    const pageSize = DEFAULT_RESULT_NUMBER;

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const query = this.userRepository
      .createQueryBuilder('u')
      .addOrderBy('u.createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (pageNumber || 0));

    if (criteria) {
      query.where(this.findByNameOrEmail()).setParameter('search', `%${criteria}%`);
    }

    const [entities, count] = await query.getManyAndCount();

    return {
      resources: entities.map((entity) => toUserDto(entity)),
      pagination: {
        number: pageNumber,
        current_index: pageNumber,
        total_elements: count,
        total_pages: Math.ceil(count / pageSize),
      },
    };
  }

  async updateProfileAsAdmin(id: string, currentUserId: string, dto: UpdateFullUserProfileInputDto) {
    // TODO
  }

  async delete(id: string, currentUserId: string) {
    // TODO
  }

  private findByNameOrEmail() {
    return new Brackets((cb) =>
      cb
        .where('lower(u.firstName) like :search')
        .orWhere('lower(u.lastName) like :search')
        .orWhere('lower(u.email) like :search')
    );
  }
}
