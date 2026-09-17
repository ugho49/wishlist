import type { RootState } from '../../../core/store';

import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { AdminLayout } from '@wishlist/front-components/admin/AdminLayout';
import { SEO } from '@wishlist/front-components/SEO';
import { useSelector } from 'react-redux';

const mapUser = (state: RootState) => state.auth.user;

const isAdminListPath = (pathname: string) => {
  const path = pathname.replace(/\/$/, '');
  return path === '/admin/users' || path === '/admin/events';
};

export const Route = createFileRoute('/_authenticated/_with-layout/admin')({
  component: () => {
    const user = useSelector(mapUser);
    const pathname = useLocation({ select: location => location.pathname });
    const isAdmin = user?.isAdmin || false;

    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }

    return (
      <>
        <SEO title="Administration" description="Panneau d'administration de Wishlist." />
        <AdminLayout fillViewport={isAdminListPath(pathname)}>
          <Outlet />
        </AdminLayout>
      </>
    );
  },
});
