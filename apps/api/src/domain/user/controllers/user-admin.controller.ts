import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFullUserProfileInputDto, UserDto } from '@wishlist/common-types';
import { Admin, CurrentUser } from '../../auth';

@Admin()
@ApiTags('User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }

  @Patch('/:id')
  async updateFullUserProfile(
    @Param('id') id: string,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<void> {
    // this.userService.findById(id);
  }

  /*
      @GetMapping
    public PagedResponse<User> getAllPaginated(@RequestParam(name = "p", required = false, defaultValue = "0") int pageNumber,
                                               @RequestParam(name = "q", required = false, defaultValue = "") String criteria) {
        return getUserUseCase.findAllByCriteriaPaginated(pageNumber, criteria);
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<Void> updateFullUserProfile(@LoggedUser CurrentUser currentUser, @PathVariable("userId") UUID userId,
                                                      @Valid @RequestBody UpdateFullUserProfileRequest body) {
        updateUserUseCase.updateProfileAsAdmin(userId, currentUser, body);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserById(@LoggedUser CurrentUser currentUser, @PathVariable("userId") UUID userId) {
        deleteUserUseCase.delete(userId, currentUser);
        return ResponseEntity.accepted().build();
    }
   */
}
