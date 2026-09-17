import { useNavigate, useSearch } from '@tanstack/react-router';

import { useAdminEventsStatsQuery } from '../../../gql';
import { AdminPageHeader } from '../../admin/AdminPageHeader';
import { AdminSection } from '../../admin/AdminSection';
import { AdminListEvents } from './AdminListEvents';

export const AdminListEventsPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/admin/events/' });
  const navigate = useNavigate({ from: '/admin/events/' });
  const { data: statsData } = useAdminEventsStatsQuery({}, { select: d => d.adminEventsStats });
  const stats = statsData?.__typename === 'AdminEventsStats' ? statsData : undefined;

  const changeCurrentPage = (page: number) => {
    void navigate({ search: prev => ({ ...prev, page }) });
  };

  return (
    <>
      <AdminPageHeader
        title="Évènements"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Évènements' }]}
        count={stats?.totalCount}
      />

      <AdminSection>
        <AdminListEvents currentPage={currentPage} changeCurrentPage={changeCurrentPage} />
      </AdminSection>
    </>
  );
};
