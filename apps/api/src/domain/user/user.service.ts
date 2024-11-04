import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { DEFAULT_RESULT_NUMBER, uuid } from '@wishlist/common'
import { Database, DATABASE, UserTable } from '@wishlist/common-database'
import {
  ChangeUserPasswordInputDto,
  createPagedResponse,
  ICurrentUser,
  MiniUserDto,
  PagedResponse,
  RegisterUserInputDto,
  RegisterUserWithGoogleInputDto,
  UpdateFullUserProfileInputDto,
  UpdateUserPictureOutputDto,
  UpdateUserProfileInputDto,
  UserDto,
  UserSocialType,
} from '@wishlist/common-types'
import { User, UserEmailSettings, UserId, UserSocial } from '@wishlist/domain'
import { Updateable } from 'kysely'
import { isEmpty } from 'lodash'

import { BucketService } from '../../core/bucket/bucket.service'
import { PasswordManager } from '../auth'
import { GoogleAuthService } from '../auth-social'
import { UserEmailSettingsMapper } from '../email-setttings/email-settings.mapper'
import { UserMailer } from './user.mailer'
import { UserMapper } from './user.mapper'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly userRepository: UserRepository,
    private readonly userMailer: UserMailer,
    private readonly googleAuthService: GoogleAuthService,
    private readonly bucketService: BucketService,
  ) {}

  findById(id: UserId): Promise<UserDto> {
    return this.userRepository.findByIdOrFail(id).then(UserMapper.toUserDto)
  }

  async create(param: {
    dto: Omit<RegisterUserInputDto, 'password'> & { password?: string }
    ip: string
    social?: (userId: UserId) => UserSocial
  }): Promise<MiniUserDto> {
    const { dto, ip, social } = param

    try {
      let user = new User({
        id: User.getNewId(),
        email: dto.email,
        firstName: dto.firstname,
        lastName: dto.lastname,
        passwordEnc: dto.password ? await PasswordManager.hash(dto.password) : undefined,
        lastConnectedAt: new Date(),
        lastIp: ip,
      })

      const settings = new UserEmailSettings({
        id: UserEmailSettings.getNewId(),
        userId: user.id,
        dailyNewItemNotification: true,
      })

      const socialEntity = social ? social(user.id) : undefined

      if (socialEntity) user = user.updatePictureUrl(socialEntity.pictureUrl)

      await this.db.transaction().execute(async trx => {
        await trx.insertInto('user').values(UserMapper.toInsertable(user)).execute()
        await trx.insertInto('user_email_setting').values(UserEmailSettingsMapper.toInsertable(settings)).execute()
        await trx
          .updateTable('event_attendee')
          .set({ user_id: user.id, temp_user_email: null })
          .where('temp_user_email', '=', user.email)
          .execute()
      })

      try {
        await this.userMailer.sendWelcomeMail({ email: user.email })
      } catch (e) {
        this.logger.error('Fail to send welcome mail to user', e)
      }

      return UserMapper.toMiniUserDto(user)
    } catch {
      throw new UnprocessableEntityException()
    }
  }

  async createFromGoogle(param: { ip: string; dto: RegisterUserWithGoogleInputDto }): Promise<MiniUserDto> {
    const payload = await this.googleAuthService.verify(param.dto.credential)

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid')
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email must be verified')
    }

    return this.create({
      ip: param.ip,
      dto: {
        email: payload.email || '',
        firstname: payload.given_name || '',
        lastname: payload.family_name || '',
      },
      social: userId =>
        new UserSocial({
          id: UserSocial.getNewId(),
          userId,
          externalProviderId: payload.sub,
          socialType: UserSocialType.GOOGLE,
          pictureUrl: payload.picture,
        }),
    })
  }

  async update(param: { currentUserId: UserId; dto: UpdateUserProfileInputDto }): Promise<void> {
    const { dto, currentUserId } = param

    await this.userRepository.update(currentUserId, {
      first_name: dto.firstname,
      last_name: dto.lastname,
      birthday: dto.birthday ?? null,
    })
  }

  async changeUserPassword(param: { currentUserId: UserId; dto: ChangeUserPasswordInputDto }) {
    const { dto, currentUserId } = param

    const user = await this.userRepository.findByIdOrFail(currentUserId)

    if (
      !(await PasswordManager.verify({
        hash: user.passwordEnc || undefined,
        plainPassword: dto.old_password,
      }))
    ) {
      throw new BadRequestException("Old password don't match with user password")
    }

    const newPassword = await PasswordManager.hash(dto.new_password)

    await this.userRepository.update(currentUserId, {
      password_enc: newPassword,
    })
  }

  async searchByKeyword(param: { currentUserId: UserId; criteria: string }): Promise<MiniUserDto[]> {
    const { criteria, currentUserId } = param

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const users = await this.userRepository.searchByKeyword({ userId: currentUserId, keyword: criteria })

    return users.map(entity => UserMapper.toMiniUserDto(entity))
  }

  async findAllByCriteriaPaginated(param: { pageNumber: number; criteria?: string }): Promise<PagedResponse<UserDto>> {
    const { criteria, pageNumber } = param
    const pageSize = DEFAULT_RESULT_NUMBER
    const skip = pageSize * (pageNumber - 1)

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const { users, total } = await this.userRepository.findAllByCriteriaPaginated({
      criteria,
      take: pageSize,
      skip,
    })

    return createPagedResponse({
      resources: users.map(UserMapper.toUserDto),
      options: { pageSize, totalElements: total, pageNumber },
    })
  }

  async updateProfileAsAdmin(param: {
    userId: UserId
    currentUser: ICurrentUser
    dto: UpdateFullUserProfileInputDto
  }): Promise<void> {
    const { currentUser, userId, dto } = param
    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot update yourself')
    }

    const userToUpdate = await this.userRepository.findByIdOrFail(userId)

    const canUpdateUser = (currentUser.isSuperAdmin && !userToUpdate.isSuperAdmin()) || !userToUpdate.isAdmin()

    if (!canUpdateUser) {
      throw new UnauthorizedException('You cannot update this user')
    }

    let params: Updateable<UserTable> = {}

    if (dto.email && userToUpdate.email !== dto.email) {
      if (await this.userRepository.existByEmail(dto.email)) {
        throw new BadRequestException('A user already exist with this email')
      }

      params = { ...userToUpdate, email: dto.email }
    }

    if (dto.new_password) params = { ...userToUpdate, password_enc: await PasswordManager.hash(dto.new_password) }
    if (dto.firstname) params = { ...userToUpdate, first_name: dto.firstname }
    if (dto.lastname) params = { ...userToUpdate, last_name: dto.lastname }
    if (dto.birthday) params = { ...userToUpdate, birthday: dto.birthday }
    if (dto.is_enabled !== undefined) params = { ...userToUpdate, is_enabled: dto.is_enabled }

    await this.userRepository.update(userId, params)
  }

  async delete(param: { userId: UserId; currentUser: ICurrentUser }): Promise<void> {
    const { currentUser, userId } = param

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot delete yourself')
    }

    const userToDelete = await this.userRepository.findByIdOrFail(userId)

    const canDeleteUser = (currentUser.isSuperAdmin && !userToDelete.isSuperAdmin()) || !userToDelete.isAdmin()

    if (!canDeleteUser) {
      throw new UnauthorizedException('You cannot delete this user')
    }

    await this.userRepository.delete(userId)
  }

  async uploadPicture(param: { userId: UserId; file: Express.Multer.File }): Promise<UpdateUserPictureOutputDto> {
    const { userId, file } = param
    try {
      await this.removeBucketPicture(userId)
    } catch (e) {
      this.logger.error('Fail to delete existing picture for user', userId, e)
    }
    const publicUrl = await this.bucketService.upload({
      destination: `pictures/users/${userId}/${uuid()}`,
      data: file.buffer,
      contentType: file.mimetype,
    })
    await this.userRepository.update(userId, {
      picture_url: publicUrl,
    })

    return {
      picture_url: publicUrl,
    }
  }

  async removePicture(param: { userId: UserId }): Promise<void> {
    const { userId } = param
    await this.removeBucketPicture(userId)
    await this.userRepository.update(userId, {
      picture_url: null,
    })
  }

  async updatePictureFromSocial(param: { currentUserId: UserId; socialId: string }) {
    const { currentUserId, socialId } = param
    const user = await this.userRepository.findByIdOrFail(currentUserId)
    const social = user.socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    if (user.pictureUrl) {
      await this.removeBucketPicture(currentUserId)
    }

    await this.userRepository.update(currentUserId, {
      picture_url: social.pictureUrl,
    })
  }

  private async removeBucketPicture(userId: UserId): Promise<void> {
    await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
    await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` })
  }
}
