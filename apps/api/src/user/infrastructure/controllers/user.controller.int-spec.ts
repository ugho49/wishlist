import { useTestApp } from '@wishlist/api-test-utils';

describe('UserController', () => {
  const { getRequest } = useTestApp();

  describe('POST /user/upload-picture', () => {
    const path = '/user/upload-picture';

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest();

      await request.post(path).expect(401);
    });

    // TODO: create later when we are able to mock and assert file upload
  });
});
