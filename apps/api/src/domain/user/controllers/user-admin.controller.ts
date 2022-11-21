import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import { GetAllUsersQueryDto, PagedResponse, UpdateFullUserProfileInputDto, UserDto } from '@wishlist/common-types';
import { CurrentUser, IsAdmin } from '../../auth';

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
    @Param('id') id: string,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<void> {
    await this.userService.updateProfileAsAdmin(id, currentUserId, dto);
  }

  @Delete('/:id')
  async deleteUserById(@Param('id') id: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    await this.userService.delete(id, currentUserId);
  }
}
