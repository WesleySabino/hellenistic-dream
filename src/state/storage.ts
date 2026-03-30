import type { DailyWeight, DomainState, Profile, WeeklyMeasurement } from '../domain/types';

const STORAGE_KEY = 'hellenistic-dream/state/v2';

const mockInitialState: DomainState = {
  profile: {
    name: 'Demo',
    sex: 'male',
    heightCm: 178,
    currentGoal: 'unsure'
  },
  dailyWeights: [
    { date: '2026-03-22', weightKg: 81.2 },
    { date: '2026-03-23', weightKg: 81.0 },
    { date: '2026-03-24', weightKg: 80.8 },
    { date: '2026-03-25', weightKg: 80.9 },
    { date: '2026-03-26', weightKg: 80.7 },
    { date: '2026-03-27', weightKg: 80.6 },
    { date: '2026-03-28', weightKg: 80.5 }
  ],
  weeklyMeasurements: [
    { date: '2026-03-15', waistCm: 86.0, bodyFatPct: 17.2 },
    { date: '2026-03-22', waistCm: 85.4, bodyFatPct: 16.9 },
    { date: '2026-03-29', waistCm: 85.0, bodyFatPct: 16.7 }
  ]
};

function cloneState(state: DomainState): DomainState {
  return {
    profile: state.profile ? { ...state.profile } : null,
    dailyWeights: state.dailyWeights.map((item) => ({ ...item })),
    weeklyMeasurements: state.weeklyMeasurements.map((item) => ({ ...item }))
  };
}

function normalizeState(raw: unknown): DomainState {
  const safe = (raw ?? {}) as Partial<DomainState> & { weeklyCheckIns?: WeeklyMeasurement[] };

  return {
    profile: safe.profile ?? null,
    dailyWeights: Array.isArray(safe.dailyWeights) ? safe.dailyWeights : [],
    weeklyMeasurements: Array.isArray(safe.weeklyMeasurements)
      ? safe.weeklyMeasurements
      : Array.isArray(safe.weeklyCheckIns)
        ? safe.weeklyCheckIns
        : []
  };
}

class LocalStateStorage {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  read(): DomainState {
    const raw = localStorage.getItem(this.key);
    if (!raw) return cloneState(mockInitialState);

    try {
      const parsed = JSON.parse(raw) as unknown;
      return normalizeState(parsed);
    } catch {
      return cloneState(mockInitialState);
    }
  }

  write(state: DomainState): void {
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}

const storage = new LocalStateStorage(STORAGE_KEY);

export const initialState: DomainState = cloneState(mockInitialState);

export const localStateRepository = {
  getState(): DomainState {
    return storage.read();
  },

  saveState(state: DomainState): void {
    storage.write(state);
  },

  saveProfile(profile: Profile): DomainState {
    const current = storage.read();
    const next: DomainState = { ...current, profile };
    storage.write(next);
    return next;
  },

  addDailyWeight(entry: DailyWeight): DomainState {
    const current = storage.read();
    const next: DomainState = {
      ...current,
      dailyWeights: [...current.dailyWeights, entry]
    };
    storage.write(next);
    return next;
  },

  addWeeklyMeasurement(entry: WeeklyMeasurement): DomainState {
    const current = storage.read();
    const next: DomainState = {
      ...current,
      weeklyMeasurements: [...current.weeklyMeasurements, entry]
    };
    storage.write(next);
    return next;
  },

  reset(): DomainState {
    storage.clear();
    storage.write(mockInitialState);
    return cloneState(mockInitialState);
  }
};

// Compatibility exports for current UI wiring while UI is being bootstrapped.
export const loadState = () => localStateRepository.getState();
export const saveState = (state: DomainState) => localStateRepository.saveState(state);
