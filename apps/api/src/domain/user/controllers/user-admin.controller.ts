import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import {
  GetAllUsersQueryDto,
  PagedResponse,
  UpdateFullUserProfileInputDto,
  UserDto,
  ICurrentUser,
} from '@wishlist/common-types';
import { CurrentUser, IsAdmin } from '../../auth';

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllUsersQueryDto): Promise<PagedResponse<UserDto>> {
    return this.userService.findAllByCriteriaPaginated({ pageNumber: queryParams.p || 1, criteria: queryParams.q });
  }

  @Patch('/:id')
  updateFullUserProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser() currentUser: ICurrentUser
  ): Promise<void> {
    return this.userService.updateProfileAsAdmin({ userId, currentUser, dto });
  }

  @Delete('/:id')
  deleteUserById(@Param('id') userId: string, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.userService.delete({ userId, currentUser });
  }
}
