export type Sex = 'male' | 'female';

export type Goal = 'gain' | 'lose' | 'unsure';

export type Recommendation = 'CUT' | 'BULK' | 'LIVRE ESCOLHA';

export type Confidence = 'Baixa' | 'Moderada' | 'Alta';

export interface UserProfile {
  name?: string;
  sex: Sex;
  heightCm: number;
  currentGoal?: Goal;
}

export interface DailyWeightEntry {
  date: string;
  weightKg: number;
  note?: string;
}

export interface WeeklyCheckIn {
  date: string;
  waistCm: number;
  bodyFatPct?: number;
  note?: string;
}

export interface AppState {
  profile: UserProfile | null;
  dailyWeights: DailyWeightEntry[];
  weeklyCheckIns: WeeklyCheckIn[];
}
