import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
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
  ICurrentUser,
} from '@wishlist/common-types';
import { PasswordManager } from '../auth';
import { toMiniUserDto, toUserDto } from './user.mapper';
import { isEmpty } from 'lodash';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { UserRepository } from './user.repository';
import { UserMailer } from './user.mailer';
import { UserEmailSettingEntity } from '../email-setttings/email-settings.entity';
import { AttendeeEntity } from '../attendee/attendee.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository, private readonly userMailer: UserMailer) {}

  findById(id: string): Promise<UserDto> {
    return this.userRepository.findOneByOrFail({ id }).then((entity) => toUserDto(entity));
  }

  async create(param: { dto: RegisterUserInputDto; ip: string }): Promise<MiniUserDto> {
    const { dto, ip } = param;

    try {
      const entity = UserEntity.create({
        email: dto.email,
        firstName: dto.firstname,
        lastName: dto.lastname,
        passwordEnc: await PasswordManager.hash(dto.password),
        ip,
      });

      const settings = UserEmailSettingEntity.create({ userId: entity.id });

      await this.userRepository.transaction(async (em) => {
        await em.save(UserEntity, entity);
        await em.save(UserEmailSettingEntity, settings);
        await em.update(
          AttendeeEntity,
          { email: entity.email },
          {
            email: null,
            userId: entity.id,
          }
        );
      });

      try {
        await this.userMailer.sendWelcomeMail({ email: entity.email, firstName: entity.firstName });
      } catch (e) {
        this.logger.error('Fail to send welcome mail to user');
      }

      return toMiniUserDto(entity);
    } catch (e) {
      throw new UnprocessableEntityException();
    }
  }

  async update(param: { currentUserId: string; dto: UpdateUserProfileInputDto }): Promise<void> {
    const { dto, currentUserId } = param;

    await this.userRepository.updateById(currentUserId, {
      firstName: dto.firstname,
      lastName: dto.lastname,
      birthday: dto.birthday || null,
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

  async findAllByCriteriaPaginated(param: { pageNumber: number; criteria?: string }): Promise<PagedResponse<UserDto>> {
    const { criteria, pageNumber } = param;
    const pageSize = DEFAULT_RESULT_NUMBER;
    const skip = pageSize * (pageNumber - 1);

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const [entities, totalElements] = await this.userRepository.findAllByCriteriaPaginated({
      criteria,
      take: pageSize,
      skip,
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
      if (await this.userRepository.exist({ where: { email: dto.email } })) {
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
