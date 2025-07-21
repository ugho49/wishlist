import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import {
  ChangeUserPasswordInputDto,
  createPagedResponse,
  ICurrentUser,
  MiniUserDto,
  PagedResponse,
  UpdateUserPictureOutputDto,
  UserDto,
  UserId,
  UserSocialId,
  uuid,
} from '@wishlist/common'
import { isEmpty } from 'lodash'

import { PasswordManager } from '../../auth'
import { BucketService, DEFAULT_RESULT_NUMBER } from '../../core'
import { toMiniUserDto, toUserDto } from './legacy-user.mapper'
import { LegacyUserRepository } from './legacy-user.repository'

/**
 * @deprecated
 */
@Injectable()
export class LegacyUserService {
  private readonly logger = new Logger(LegacyUserService.name)

  constructor(
    private readonly userRepository: LegacyUserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async changeUserPassword(param: { currentUserId: UserId; dto: ChangeUserPasswordInputDto }) {
    const { dto, currentUserId } = param

    const entity = await this.userRepository.findOneByOrFail({ id: currentUserId })

    if (
      !(await PasswordManager.verify({
        hash: entity.passwordEnc || undefined,
        plainPassword: dto.old_password,
      }))
    ) {
      throw new BadRequestException("Old password don't match with user password")
    }

    const newPassword = await PasswordManager.hash(dto.new_password)

    await this.userRepository.updateById(currentUserId, {
      passwordEnc: newPassword,
    })
  }

  async searchByKeyword(param: { currentUserId: UserId; criteria: string }): Promise<MiniUserDto[]> {
    const { criteria, currentUserId } = param

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const entities = await this.userRepository.searchByKeyword({ userId: currentUserId, keyword: criteria })

    return entities.map(entity => toMiniUserDto(entity))
  }

  async findAllByCriteriaPaginated(param: { pageNumber: number; criteria?: string }): Promise<PagedResponse<UserDto>> {
    const { criteria, pageNumber } = param
    const pageSize = DEFAULT_RESULT_NUMBER
    const skip = pageSize * (pageNumber - 1)

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const [entities, totalElements] = await this.userRepository.findAllByCriteriaPaginated({
      criteria,
      take: pageSize,
      skip,
    })

    return createPagedResponse({
      resources: await Promise.all(entities.map(entity => toUserDto(entity))),
      options: { pageSize, totalElements, pageNumber },
    })
  }

  async delete(param: { userId: UserId; currentUser: ICurrentUser }): Promise<void> {
    const { currentUser, userId } = param

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot delete yourself')
    }

    const userToDelete = await this.userRepository.findOneByOrFail({ id: userId })

    const canDeleteUser = (currentUser.isSuperAdmin && !userToDelete.isSuperAdmin()) || !userToDelete.isAdmin()

    if (!canDeleteUser) {
      throw new UnauthorizedException('You cannot delete this user')
    }

    await this.userRepository.delete({ id: userId })
  }

  async uploadPicture(param: { userId: UserId; file: Express.Multer.File }): Promise<UpdateUserPictureOutputDto> {
    const { userId, file } = param
    try {
      await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${userId}/` })
    } catch (e) {
      this.logger.error('Fail to delete existing picture for user', userId, e)
    }
    const publicUrl = await this.bucketService.upload({
      destination: `pictures/users/${userId}/${uuid()}`,
      data: file.buffer,
      contentType: file.mimetype,
    })
    await this.userRepository.update(
      { id: userId },
      {
        pictureUrl: publicUrl,
      },
    )
    return {
      picture_url: publicUrl,
    }
  }

  async removePicture(param: { userId: UserId }): Promise<void> {
    const { userId } = param
    await this.bucketService.removeIfExist({ destination: `pictures/${userId}/` }) // TODO: to be removed
    await this.bucketService.removeIfExist({ destination: `pictures/users${userId}/` })
    await this.userRepository.update({ id: userId }, { pictureUrl: null })
  }

  async updatePictureFromSocial(param: { currentUserId: UserId; socialId: UserSocialId }) {
    const { currentUserId, socialId } = param
    const user = await this.userRepository.findOneByOrFail({ id: currentUserId })
    const socials = await user.socials
    const social = socials.find(s => s.id === socialId)

    if (!social) throw new NotFoundException('This social id does not exist')

    if (user.pictureUrl) {
      await this.bucketService.removeIfExist({ destination: `pictures/${currentUserId}/` }) // TODO: to be removed
      await this.bucketService.removeIfExist({ destination: `pictures/users/${currentUserId}/` })
    }

    await this.userRepository.update({ id: currentUserId }, { pictureUrl: social.pictureUrl })
  }
}
