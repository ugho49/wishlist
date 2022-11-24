import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import { GetAllUsersQueryDto, PagedResponse, UpdateFullUserProfileInputDto, UserDto } from '@wishlist/common-types';
import { CurrentUser, ICurrentUser, IsAdmin } from '../../auth';

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }

  @Get()
  async getAllPaginated(@Query() queryParams: GetAllUsersQueryDto): Promise<PagedResponse<UserDto>> {
    return this.userService.findAllByCriteriaPaginated({ pageNumber: queryParams.p, criteria: queryParams.q });
  }

  @Patch('/:id')
  async updateFullUserProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser() currentUser: ICurrentUser
  ): Promise<void> {
    await this.userService.updateProfileAsAdmin({ userId, currentUser, dto });
  }

  @Delete('/:id')
  async deleteUserById(@Param('id') userId: string, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.userService.delete({ userId, currentUser });
  }
}
