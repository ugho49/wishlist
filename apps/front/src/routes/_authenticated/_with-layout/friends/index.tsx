import { createFileRoute } from '@tanstack/react-router';
import { SEO } from '@wishlist/front-components/SEO';

import { FriendsPage } from '../../../../components/friend/FriendsPage';

export const Route = createFileRoute('/_authenticated/_with-layout/friends/')({
  component: () => (
    <>
      <SEO
        title="Amis"
        description="Gérez les personnes avec qui vous partagez vos listes et vos évènements."
        canonical="/friends"
      />
      <FriendsPage />
    </>
  ),
});
