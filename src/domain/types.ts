export type Sex = 'male' | 'female';

export type Goal = 'gain' | 'lose' | 'unsure';

export type Recommendation = 'CUT' | 'BULK' | 'LIVRE ESCOLHA';

export type Confidence = 'Baixa' | 'Moderada' | 'Alta';

export type Trend = 'subindo' | 'caindo' | 'estavel';

export interface Profile {
  name?: string;
  sex: Sex;
  heightCm: number;
  currentGoal?: Goal;
}

export interface DailyWeight {
  date: string;
  weightKg: number;
  note?: string;
}

export interface WeeklyMeasurement {
  date: string;
  waistCm: number;
  bodyFatPct?: number;
  note?: string;
}

export interface DomainState {
  profile: Profile | null;
  dailyWeights: DailyWeight[];
  weeklyMeasurements: WeeklyMeasurement[];
}

export interface CalculatedState {
  recommendation: Recommendation;
  reason: string;
  explanation: string[];
  confidence: Confidence;
  whtr: number | null;
  avgWeight7d: number | null;
  latestWaistCm: number | null;
  latestBodyFatPct: number | null;
  weightTrend: Trend | null;
  waistTrend: Trend | null;
}

// Backward-compatible aliases during the bootstrap phase of the project.
export type UserProfile = Profile;
export type DailyWeightEntry = DailyWeight;
export type WeeklyCheckIn = WeeklyMeasurement;
export type AppState = DomainState;
