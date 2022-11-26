import React from 'react';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { useAsync } from 'react-use';

export type HomePageProps = unknown;

export const HomePage = (props: HomePageProps) => {
  const api = useApi(wishlistApiRef);

  const { value } = useAsync(() => api.user.getInfo(), []);

  return (
    <div>
      <h1>HomePage</h1>

      <div>Current user:</div>

      <code>{JSON.stringify(value, null, 2)}</code>
    </div>
  );
};
