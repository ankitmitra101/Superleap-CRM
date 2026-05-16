import { useSearchParams } from 'react-router-dom';

export const useLeadFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const setSearch = (query: string) => {
    setSearchParams(prev => {
      if (query) prev.set('search', query);
      else prev.delete('search');
      return prev;
    }, { replace: true });
  };

  const setStatus = (newStatus: string) => {
    setSearchParams(prev => {
      if (newStatus) prev.set('status', newStatus);
      else prev.delete('status');
      return prev;
    }, { replace: true });
  };

  return { search, status, setSearch, setStatus, searchParams };
};