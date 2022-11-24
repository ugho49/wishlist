import { BadRequestException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Brackets, In, Not } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  ChangeUserPasswordInputDto,
  createPagedResponse,
  MiniUserDto,
  PagedResponse,
  RegisterUserInputDto,
  UpdateFullUserProfileInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';
import { ICurrentUser, PasswordManager } from '../auth';
import { toMiniUserDto, toUserDto } from './user.mapper';
import { isEmpty } from 'lodash';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findById(id: string): Promise<UserDto> {
    return this.userRepository.findOneByOrFail({ id }).then((entity) => toUserDto(entity));
  }

  findEntityById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id });
  }

  findEntityByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findEntitiesByEmail(emails: string[]): Promise<UserEntity[]> {
    return this.userRepository.findBy({ email: In(emails) });
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

  async updateLogin(id: string, props: { lastIp: string; lastConnectedAt: Date }): Promise<void> {
    await this.userRepository.update(
      { id },
      {
        lastIp: props.lastIp,
        lastConnectedAt: props.lastConnectedAt,
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
      .andWhere(this.findByNameOrEmail(searchKey))
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
      query.where(this.findByNameOrEmail(criteria));
    }

    const [entities, totalElements] = await query.getManyAndCount();

    return createPagedResponse({
      resources: entities.map((entity) => toUserDto(entity)),
      options: { pageSize, totalElements, pageNumber },
    });
  }

  async updateProfileAsAdmin(id: string, currentUser: ICurrentUser, dto: UpdateFullUserProfileInputDto): Promise<void> {
    if (id === currentUser.id) {
      throw new UnauthorizedException('You cannot upadte yourself');
    }

    const userToUpdate = await this.userRepository.findOneByOrFail({ id });

    const canUpdateUser = (currentUser.isSuperAdmin && !userToUpdate.isSuperAdmin()) || !userToUpdate.isAdmin();

    if (!canUpdateUser) {
      throw new UnauthorizedException('You cannot update this user');
    }

    if (dto.email && userToUpdate.email !== dto.email) {
      if ((await this.userRepository.count({ where: { email: dto.email } })) > 0) {
        throw new BadRequestException('A user already exist with this email');
      }

      userToUpdate.email = dto.email;
    }

    if (dto.new_password) userToUpdate.passwordEnc = await PasswordManager.hash(dto.new_password);
    if (dto.firstname) userToUpdate.firstName = dto.firstname;
    if (dto.lastname) userToUpdate.lastName = dto.lastname;
    if (dto.birthday) userToUpdate.birthday = dto.birthday;
    if (dto.is_enabled !== undefined) userToUpdate.isEnabled = dto.is_enabled;

    await this.userRepository.update({ id }, userToUpdate);
  }

  async delete(id: string, currentUser: ICurrentUser): Promise<void> {
    if (id === currentUser.id) {
      throw new UnauthorizedException('You cannot delete yourself');
    }

    const userToDelete = await this.userRepository.findOneByOrFail({ id });

    const canDeleteUser = (currentUser.isSuperAdmin && !userToDelete.isSuperAdmin()) || !userToDelete.isAdmin();

    if (!canDeleteUser) {
      throw new UnauthorizedException('You cannot delete this user');
    }

    await this.userRepository.delete({ id });
  }

  private findByNameOrEmail(search: string) {
    const searchKey = `%${search}%`;

    return new Brackets((cb) =>
      cb
        .where('lower(u.firstName) like :search', { search: searchKey })
        .orWhere('lower(u.lastName) like :search', { search: searchKey })
        .orWhere('lower(u.email) like :search', { search: searchKey })
    );
  }
}
