import { useMemo, useState } from 'react';
import { CheckInScreen } from './components/CheckInScreen';
import { Dashboard } from './components/Dashboard';
import { HistoryScreen } from './components/HistoryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import type { DailyWeightEntry, UserProfile, WeeklyCheckIn } from './domain/types';
import { localStateRepository } from './state/storage';

type Tab = 'dashboard' | 'checkin' | 'history' | 'profile';

export function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [state, setState] = useState(() => localStateRepository.getState());

  const sortedState = useMemo(() => {
    return {
      ...state,
      dailyWeights: [...state.dailyWeights].sort((a, b) => a.date.localeCompare(b.date)),
      weeklyMeasurements: [...state.weeklyMeasurements].sort((a, b) => a.date.localeCompare(b.date))
    };
  }, [state]);

  const addDailyWeight = (entry: DailyWeightEntry) => {
    setState(localStateRepository.addDailyWeight(entry));
    setTab('dashboard');
  };

  const addWeeklyCheckIn = (entry: WeeklyCheckIn) => {
    setState(localStateRepository.addWeeklyMeasurement(entry));
    setTab('dashboard');
  };

  const saveProfile = (profile: UserProfile) => {
    setState(localStateRepository.saveProfile(profile));
    setTab('dashboard');
  };

  return (
    <main className="app-shell">
      <nav className="tabs" aria-label="Navegação principal">
        <button onClick={() => setTab('dashboard')} className={tab === 'dashboard' ? 'active' : ''}>
          Dashboard
        </button>
        <button onClick={() => setTab('checkin')} className={tab === 'checkin' ? 'active' : ''}>
          Check-in
        </button>
        <button onClick={() => setTab('history')} className={tab === 'history' ? 'active' : ''}>
          Histórico
        </button>
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'active' : ''}>
          Perfil
        </button>
      </nav>

      {tab === 'dashboard' && <Dashboard state={sortedState} />}
      {tab === 'checkin' && <CheckInScreen onAddDaily={addDailyWeight} onAddWeekly={addWeeklyCheckIn} />}
      {tab === 'history' && <HistoryScreen state={sortedState} />}
      {tab === 'profile' && <ProfileScreen profile={state.profile} onSave={saveProfile} />}

      <button className="ghost" onClick={() => setState(localStateRepository.reset())}>
        Restaurar dados de desenvolvimento
      </button>
    </main>
  );
}
