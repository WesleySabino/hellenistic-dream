import { useMemo, useState } from 'react';
import { CheckInScreen } from './components/CheckInScreen';
import { Dashboard } from './components/Dashboard';
import { DecisionScreen } from './components/DecisionScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import type { DailyWeightEntry, UserProfile, WeeklyCheckIn } from './domain/types';
import { localStateRepository } from './state/storage';

type Tab = 'dashboard' | 'decision' | 'checkin' | 'history' | 'profile';

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
    setState(localStateRepository.upsertDailyWeight(entry));
  };

  const addWeeklyCheckIn = (entry: WeeklyCheckIn) => {
    setState(localStateRepository.addWeeklyMeasurement(entry));
  };

  const updateDailyWeight = (entry: DailyWeightEntry) => {
    setState(localStateRepository.upsertDailyWeight(entry));
  };

  const updateWeeklyMeasurement = (entry: WeeklyCheckIn) => {
    setState(localStateRepository.upsertWeeklyMeasurement(entry));
  };

  const deleteDailyWeight = (date: string) => {
    setState(localStateRepository.deleteDailyWeight(date));
  };

  const deleteWeeklyMeasurement = (date: string) => {
    setState(localStateRepository.deleteWeeklyMeasurement(date));
  };

  const saveProfile = (profile: UserProfile) => {
    setState(localStateRepository.saveProfile(profile));
    setTab('dashboard');
  };

  const completeOnboarding = (payload: {
    profile: UserProfile;
    initialWeightKg: number;
    initialMeasurement: WeeklyCheckIn;
  }) => {
    setState(
      localStateRepository.completeOnboarding({
        profile: payload.profile,
        dailyWeight: {
          date: payload.initialMeasurement.date,
          weightKg: payload.initialWeightKg
        },
        weeklyMeasurement: payload.initialMeasurement
      })
    );
    setTab('dashboard');
  };

  const needsOnboarding = !state.profile || state.dailyWeights.length === 0 || state.weeklyMeasurements.length === 0;

  if (needsOnboarding) {
    return (
      <main className="app-shell">
        <OnboardingScreen onComplete={completeOnboarding} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <nav className="tabs" aria-label="Navegação principal">
        <button onClick={() => setTab('dashboard')} className={tab === 'dashboard' ? 'active' : ''}>
          Dashboard
        </button>
        <button onClick={() => setTab('decision')} className={tab === 'decision' ? 'active' : ''}>
          Como decidiu
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
      {tab === 'decision' && <DecisionScreen state={sortedState} />}
      {tab === 'checkin' && (
        <CheckInScreen
          onAddDaily={addDailyWeight}
          onAddWeekly={addWeeklyCheckIn}
          dailyWeights={sortedState.dailyWeights}
          weeklyMeasurements={sortedState.weeklyMeasurements}
          profile={state.profile!}
        />
      )}
      {tab === 'history' && (
        <HistoryScreen
          state={sortedState}
          onUpdateDailyWeight={updateDailyWeight}
          onDeleteDailyWeight={deleteDailyWeight}
          onUpdateWeeklyMeasurement={updateWeeklyMeasurement}
          onDeleteWeeklyMeasurement={deleteWeeklyMeasurement}
        />
      )}
      {tab === 'profile' && <ProfileScreen profile={state.profile} onSave={saveProfile} />}

      <button className="ghost" onClick={() => setState(localStateRepository.reset())}>
        Limpar dados locais e reiniciar onboarding
      </button>
    </main>
  );
}
