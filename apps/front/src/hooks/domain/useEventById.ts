import { useQuery } from '@tanstack/react-query';
import { useApi } from '../useApi';

export const useEventById = (eventId?: string) => {
  const api = useApi();

  const { data, isLoading } = useQuery({
    queryKey: ['event', { id: eventId ?? 'undefined' }],
    queryFn: () => {
      if (!eventId) throw new Error('eventId is required');
      return api.event.getById(eventId);
    },
  });

  return { event: data, loading: isLoading };
};
