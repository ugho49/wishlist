import { createRouteDecorator } from '@znight/http';

/** Needs a valid access token carrying `ROLE_ADMIN` or `ROLE_SUPERADMIN`. */
export const IsAdmin = createRouteDecorator('admin', { group: 'access', required: true });
