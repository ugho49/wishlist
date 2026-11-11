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

    it('should refuse a file that is not an image, whatever its declared media type', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

      await request
        .post(path)
        .attach('file', svg, { filename: 'picture.svg', contentType: 'image/svg+xml' })
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ message: "Le fichier n'est pas une image supportée par le serveur" }),
        );
    });

    // TODO: create later when we are able to mock and assert file upload
  });
});
