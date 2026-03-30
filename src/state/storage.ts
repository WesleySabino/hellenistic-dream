import type { AppState } from '../domain/types';

const STORAGE_KEY = 'hellenistic-dream/state/v1';

export const initialState: AppState = {
  profile: null,
  dailyWeights: [],
  weeklyCheckIns: []
};

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;

  try {
    const parsed = JSON.parse(raw) as AppState;
    return {
      profile: parsed.profile ?? null,
      dailyWeights: parsed.dailyWeights ?? [],
      weeklyCheckIns: parsed.weeklyCheckIns ?? []
    };
  } catch {
    return initialState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
