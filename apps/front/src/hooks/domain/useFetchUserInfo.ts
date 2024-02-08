import { useQuery } from '@tanstack/react-query';
import { useApi } from '../useApi';

export const useFetchUserInfo = () => {
  const api = useApi();

  const { data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.user.getInfo(),
  });

  return { user: data, loading: isLoading };
};
