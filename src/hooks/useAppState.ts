import { useState, useCallback } from 'react';
import { AppState, User, LoanApplication } from '@/types';
import { loadState, saveState, authenticate, updateApplication } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useAppState() {
  const [state, setStateRaw] = useState<AppState>(() => loadState());

  const setState = useCallback((updater: (prev: AppState) => AppState) => {
    setStateRaw(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const user = authenticate(email, password, state.users);
    if (!user) return false;
    setState(prev => ({ ...prev, currentUser: user }));
    return true;
  }, [state.users, setState]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, [setState]);

  const register = useCallback((data: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  }, [setState]);

  const submitApplication = useCallback((app: LoanApplication) => {
    setState(prev => ({ ...prev, applications: [...prev.applications, app] }));
  }, [setState]);

  const updateApp = useCallback((app: LoanApplication) => {
    setState(prev => updateApplication(prev, app));
  }, [setState]);

  const advanceStatus = useCallback((appId: string) => {
    const order: LoanApplication['status'][] = [
      'submitted', 'document_review', 'credit_check', 'compliance',
      'offer_generated', 'offer_accepted', 'disbursed'
    ];
    setState(prev => {
      const app = prev.applications.find(a => a.id === appId);
      if (!app) return prev;
      const idx = order.indexOf(app.status);
      if (idx === -1 || idx >= order.length - 1) return prev;
      const nextStatus = order[idx + 1];
      const updatedTimeline = app.timeline.map(step => {
        if (step.stage === app.status) return { ...step, status: 'completed', completedAt: new Date().toISOString() };
        if (step.stage === nextStatus) return { ...step, status: 'active' };
        return step;
      });
      const updated: LoanApplication = { ...app, status: nextStatus, timeline: updatedTimeline as any, updatedAt: new Date().toISOString() };
      return updateApplication(prev, updated);
    });
  }, [setState]);

  const rejectApplication = useCallback((appId: string) => {
    setState(prev => {
      const app = prev.applications.find(a => a.id === appId);
      if (!app) return prev;
      const updated: LoanApplication = { ...app, status: 'rejected', updatedAt: new Date().toISOString() };
      return updateApplication(prev, updated);
    });
  }, [setState]);

  return {
    state,
    login,
    logout,
    register,
    submitApplication,
    updateApp,
    advanceStatus,
    rejectApplication,
  };
}
