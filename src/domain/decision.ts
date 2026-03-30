import type { CalculatedState, Confidence, DomainState, Recommendation, Sex, Trend } from './types';

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function decideByBodyFat(sex: Sex, bodyFatPct: number): Recommendation {
  if (sex === 'male') {
    if (bodyFatPct >= 20) return 'CUT';
    if (bodyFatPct < 12) return 'BULK';
    return 'LIVRE ESCOLHA';
  }

  if (bodyFatPct >= 30) return 'CUT';
  if (bodyFatPct < 20) return 'BULK';
  return 'LIVRE ESCOLHA';
}

function confidenceForState(state: DomainState): Confidence {
  const dailyCount = state.dailyWeights.length;
  const weeklyCount = state.weeklyMeasurements.length;

  if (dailyCount >= 28 && weeklyCount >= 4) return 'Alta';
  if (dailyCount >= 7 && weeklyCount >= 2) return 'Moderada';
  return 'Baixa';
}

function trendForNumbers(values: number[]): Trend | null {
  if (values.length < 2) return null;
  const diff = values[values.length - 1] - values[0];
  if (Math.abs(diff) < 0.2) return 'estavel';
  return diff > 0 ? 'subindo' : 'caindo';
}

export function getRecommendation(state: DomainState): CalculatedState {
  const lastCheckIn = state.weeklyMeasurements[state.weeklyMeasurements.length - 1];
  const avgWeight7d =
    state.dailyWeights.length === 0
      ? null
      : average(state.dailyWeights.slice(-7).map((entry) => entry.weightKg));

  const confidence = confidenceForState(state);
  const weightTrend = trendForNumbers(state.dailyWeights.slice(-7).map((entry) => entry.weightKg));
  const waistTrend = trendForNumbers(state.weeklyMeasurements.slice(-4).map((entry) => entry.waistCm));

  if (!state.profile || !lastCheckIn) {
    return {
      recommendation: 'LIVRE ESCOLHA',
      reason:
        'Ainda faltam registros para uma leitura mais confiável. Continue preenchendo seu peso diário e sua cintura semanal.',
      whtr: null,
      confidence,
      avgWeight7d,
      latestWaistCm: lastCheckIn?.waistCm ?? null,
      latestBodyFatPct: lastCheckIn?.bodyFatPct ?? null,
      weightTrend,
      waistTrend
    };
  }

  const whtr = lastCheckIn.waistCm / state.profile.heightCm;

  if (whtr >= 0.5) {
    return {
      recommendation: 'CUT',
      reason: 'Sua cintura está acima da zona considerada confortável em relação à sua altura.',
      whtr,
      confidence,
      avgWeight7d,
      latestWaistCm: lastCheckIn.waistCm,
      latestBodyFatPct: lastCheckIn.bodyFatPct ?? null,
      weightTrend,
      waistTrend
    };
  }

  if (whtr < 0.4) {
    return {
      recommendation: 'BULK',
      reason: 'Sua relação cintura/altura está em faixa baixa para priorizar ganho de massa.',
      whtr,
      confidence,
      avgWeight7d,
      latestWaistCm: lastCheckIn.waistCm,
      latestBodyFatPct: lastCheckIn.bodyFatPct ?? null,
      weightTrend,
      waistTrend
    };
  }

  if (typeof lastCheckIn.bodyFatPct === 'number') {
    const recommendation = decideByBodyFat(state.profile.sex, lastCheckIn.bodyFatPct);
    return {
      recommendation,
      reason:
        recommendation === 'LIVRE ESCOLHA'
          ? 'Seus indicadores estão em faixa intermediária. Você pode decidir junto ao seu treinador.'
          : 'A leitura de gordura corporal ajudou a definir a direção nesta faixa intermediária.',
      whtr,
      confidence,
      avgWeight7d,
      latestWaistCm: lastCheckIn.waistCm,
      latestBodyFatPct: lastCheckIn.bodyFatPct,
      weightTrend,
      waistTrend
    };
  }

  return {
    recommendation: 'LIVRE ESCOLHA',
    reason:
      'Seus indicadores estão em faixa intermediária e sem gordura corporal recente. A direção está livre para decidir com seu treinador.',
    whtr,
    confidence,
    avgWeight7d,
    latestWaistCm: lastCheckIn.waistCm,
    latestBodyFatPct: null,
    weightTrend,
    waistTrend
  };
}
