import { AppState, User, LoanApplication } from '@/types';
import { seedData } from '@/lib/seedData';

const STORAGE_KEY = 'loanflow_state';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch (e: any) {
    console.warn('Failed to load state:', e.message);
  }
  const initial = seedData();
  saveState(initial);
  return initial;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e: any) {
    console.warn('Failed to save state:', e.message);
  }
}

export function resetState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = seedData();
  saveState(fresh);
  return fresh;
}

export function authenticate(email: string, password: string, users: User[]): User | null {
  return users.find(u => u.email === email && u.password === password) || null;
}

export function updateApplication(state: AppState, updated: LoanApplication): AppState {
  return {
    ...state,
    applications: state.applications.map(a => a.id === updated.id ? updated : a),
  };
}
