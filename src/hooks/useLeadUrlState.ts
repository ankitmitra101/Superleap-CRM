// src/hooks/useLeadUrlState.ts
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useDeferredValue } from 'react';

// Strict schema validation for URL state
const UrlStateSchema = z.object({
  q: z.string().default(''),
  status: z.string().default('all'),
  view: z.enum(['list', 'board']).default('list'),
});

export const useLeadUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Safely parse URL params with fallbacks
  const state = UrlStateSchema.parse(Object.fromEntries(searchParams));
  
  // Defer the search query to prevent UI blocking during massive list filtering
  const deferredQuery = useDeferredValue(state.q);

  const updateState = (updates: Partial<typeof state>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    setSearchParams(next, { replace: true });
  };

  return { state, deferredQuery, updateState };
};