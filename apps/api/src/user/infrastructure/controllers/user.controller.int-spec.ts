import { useTestApp } from '@wishlist/api-test-utils';

describe('UserController', () => {
  const { getRequest } = useTestApp();

  describe('POST /user/upload-picture', () => {
    const path = '/user/upload-picture';

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest();

      // Multipart body required: an empty POST + FileInterceptor hangs up the socket on Bun.
      await request.post(path).field('file', 'not-a-file').expect(401);
    });

    // TODO: create later when we are able to mock and assert file upload
  });
});
