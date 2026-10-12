// Which optional features the server has switched on (for now: AI help). Asked once and kept for ten minutes.
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface Features {
  ai: boolean;
}

export function useFeatures() {
  return useQuery({ queryKey: ['features'], queryFn: () => api<Features>('/features'), staleTime: 10 * 60_000, refetchInterval: false });
}
