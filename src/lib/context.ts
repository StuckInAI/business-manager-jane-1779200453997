import { createContext, useContext } from 'react';
import { useAppState } from '@/hooks/useAppState';

type AppContextType = ReturnType<typeof useAppState>;

export const AppContext = createContext<AppContextType>(null as any);

export function useApp(): AppContextType {
  return useContext(AppContext);
}
