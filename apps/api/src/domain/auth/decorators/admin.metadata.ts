import { SetMetadata } from '@nestjs/common';

export const NEED_ADMIN_PRIVILEGES_KEY = 'needAdminPrivileges';
export const Admin = () => SetMetadata(NEED_ADMIN_PRIVILEGES_KEY, true);
