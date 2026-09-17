import { useNavigate, useSearch } from '@tanstack/react-router';

import { useAdminEventsStatsQuery } from '../../../gql';
import { AdminListPage } from '../../admin/AdminListPage';
import { AdminPageHeader } from '../../admin/AdminPageHeader';
import { AdminListEvents } from './AdminListEvents';

export const AdminListEventsPage = () => {
  const { page: currentPage, search } = useSearch({ from: '/_authenticated/_with-layout/admin/events/' });
  const navigate = useNavigate({ from: '/admin/events/' });
  const { data: statsData } = useAdminEventsStatsQuery({}, { select: d => d.adminEventsStats });
  const stats = statsData?.__typename === 'AdminEventsStats' ? statsData : undefined;

  const changeCurrentPage = (page: number) => {
    void navigate({ search: prev => ({ ...prev, page }) });
  };

  const changeSearch = (nextSearch: string) => {
    void navigate({ search: prev => ({ ...prev, page: 1, search: nextSearch }) });
  };

  return (
    <AdminListPage
      header={
        <AdminPageHeader
          title="Évènements"
          breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Évènements' }]}
          count={stats?.totalCount}
        />
      }
    >
      <AdminListEvents
        fill
        currentPage={currentPage}
        search={search}
        changeCurrentPage={changeCurrentPage}
        changeSearch={changeSearch}
      />
    </AdminListPage>
  );
};
