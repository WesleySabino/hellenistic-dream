import type { DailyWeight, DomainState, Profile, WeeklyMeasurement } from '../domain/types';

const STORAGE_KEY = 'hellenistic-dream/state/v3';

const emptyInitialState: DomainState = {
  profile: null,
  dailyWeights: [],
  weeklyMeasurements: []
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
    if (!raw) return cloneState(emptyInitialState);

    try {
      const parsed = JSON.parse(raw) as unknown;
      return normalizeState(parsed);
    } catch {
      return cloneState(emptyInitialState);
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

export const initialState: DomainState = cloneState(emptyInitialState);

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

  completeOnboarding(params: {
    profile: Profile;
    dailyWeight: DailyWeight;
    weeklyMeasurement: WeeklyMeasurement;
  }): DomainState {
    const next: DomainState = {
      profile: params.profile,
      dailyWeights: [params.dailyWeight],
      weeklyMeasurements: [params.weeklyMeasurement]
    };

    storage.write(next);
    return next;
  },

  upsertDailyWeight(entry: DailyWeight): DomainState {
    const current = storage.read();
    const withoutSameDate = current.dailyWeights.filter((item) => item.date !== entry.date);
    const next: DomainState = {
      ...current,
      dailyWeights: [...withoutSameDate, entry].sort((a, b) => a.date.localeCompare(b.date))
    };
    storage.write(next);
    return next;
  },

  addDailyWeight(entry: DailyWeight): DomainState {
    return this.upsertDailyWeight(entry);
  },

  addWeeklyMeasurement(entry: WeeklyMeasurement): DomainState {
    return this.upsertWeeklyMeasurement(entry);
  },

  upsertWeeklyMeasurement(entry: WeeklyMeasurement): DomainState {
    const current = storage.read();
    const withoutSameDate = current.weeklyMeasurements.filter((item) => item.date !== entry.date);
    const next: DomainState = {
      ...current,
      weeklyMeasurements: [...withoutSameDate, entry].sort((a, b) => a.date.localeCompare(b.date))
    };
    storage.write(next);
    return next;
  },

  deleteDailyWeight(date: string): DomainState {
    const current = storage.read();
    const next: DomainState = {
      ...current,
      dailyWeights: current.dailyWeights.filter((item) => item.date !== date)
    };
    storage.write(next);
    return next;
  },

  deleteWeeklyMeasurement(date: string): DomainState {
    const current = storage.read();
    const next: DomainState = {
      ...current,
      weeklyMeasurements: current.weeklyMeasurements.filter((item) => item.date !== date)
    };
    storage.write(next);
    return next;
  },

  reset(): DomainState {
    storage.clear();
    storage.write(emptyInitialState);
    return cloneState(emptyInitialState);
  }
};

// Compatibility exports for current UI wiring while UI is being bootstrapped.
export const loadState = () => localStateRepository.getState();
export const saveState = (state: DomainState) => localStateRepository.saveState(state);
