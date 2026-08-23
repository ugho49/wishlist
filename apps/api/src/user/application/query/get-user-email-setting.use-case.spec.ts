import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Logger, NotFoundException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserEmailSettingBuilder } from '../../../../test-utils/builders/user-email-setting.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserEmailSetting } from '../../domain/model/user-email-setting.model';
import { GetUserEmailSettingUseCase } from './get-user-email-setting.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUserEmailSettingUseCase', () => {
  const userEmailSettingRepository = createMock<UserEmailSettingRepository>();

  let useCase: GetUserEmailSettingUseCase;
  let user: User;
  let userEmailSetting: UserEmailSetting;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userEmailSetting = new UserEmailSettingBuilder().withUser(user).build();
    userEmailSettingRepository.findByUserId.mockResolvedValue(userEmailSetting);

    useCase = new GetUserEmailSettingUseCase(userEmailSettingRepository);
  });

  it('should reject when the email setting does not exist', async () => {
    userEmailSettingRepository.findByUserId.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ currentUser: toCurrentUser(user) })).rejects.toThrow(NotFoundException);
  });

  it('should return the user email setting', async () => {
    const result = await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(result).toEqual({ userEmailSetting });
    expect(userEmailSettingRepository.findByUserId).toHaveBeenCalledWith(user.id);
  });
});
