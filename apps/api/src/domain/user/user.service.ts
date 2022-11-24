import { BadRequestException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
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

  async update(param: { currentUserId: string; dto: UpdateUserProfileInputDto }): Promise<void> {
    const { dto, currentUserId } = param;

    await this.userRepository.updateById(currentUserId, {
      firstName: dto.firstname,
      lastName: dto.lastname,
      birthday: dto.birthday,
    });
  }

  async changeUserPassword(param: { currentUserId: string; dto: ChangeUserPasswordInputDto }) {
    const { dto, currentUserId } = param;

    const entity = await this.userRepository.findOneByOrFail({ id: currentUserId });

    if (!(await PasswordManager.verify(entity.passwordEnc, dto.old_password))) {
      throw new BadRequestException("Old password don't match with user password");
    }

    const newPassword = await PasswordManager.hash(dto.new_password);

    await this.userRepository.updateById(currentUserId, {
      passwordEnc: newPassword,
    });
  }

  async searchByKeyword(param: { currentUserId: string; criteria: string }): Promise<MiniUserDto[]> {
    const { criteria, currentUserId } = param;

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const entities = await this.userRepository.searchByKeyword({ userId: currentUserId, keyword: criteria });

    return entities.map((entity) => toMiniUserDto(entity));
  }

  async findAllByCriteriaPaginated(param: { pageNumber?: number; criteria?: string }): Promise<PagedResponse<UserDto>> {
    const { criteria, pageNumber } = param;
    const pageSize = DEFAULT_RESULT_NUMBER;
    const offset = pageSize * (pageNumber || 0);

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const [entities, totalElements] = await this.userRepository.findAllByCriteriaPaginated({
      criteria,
      pageSize,
      offset,
    });

    return createPagedResponse({
      resources: entities.map((entity) => toUserDto(entity)),
      options: { pageSize, totalElements, pageNumber },
    });
  }

  async updateProfileAsAdmin(param: {
    userId: string;
    currentUser: ICurrentUser;
    dto: UpdateFullUserProfileInputDto;
  }): Promise<void> {
    const { currentUser, userId, dto } = param;
    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot update yourself');
    }

    const userToUpdate = await this.userRepository.findOneByOrFail({ id: userId });

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

    await this.userRepository.updateById(userId, userToUpdate);
  }

  async delete(param: { userId: string; currentUser: ICurrentUser }): Promise<void> {
    const { currentUser, userId } = param;

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot delete yourself');
    }

    const userToDelete = await this.userRepository.findOneByOrFail({ id: userId });

    const canDeleteUser = (currentUser.isSuperAdmin && !userToDelete.isSuperAdmin()) || !userToDelete.isAdmin();

    if (!canDeleteUser) {
      throw new UnauthorizedException('You cannot delete this user');
    }

    await this.userRepository.delete({ id: userId });
  }
}
