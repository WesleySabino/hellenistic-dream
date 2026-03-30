import type { CalculatedState, Confidence, DomainState, Recommendation, Sex, Trend } from './types';

export function decideByBodyFat(sex: Sex, bodyFatPct: number): Recommendation {
  if (sex === 'male') {
    if (bodyFatPct >= 20) return 'CUT';
    if (bodyFatPct < 12) return 'BULK';
    return 'LIVRE ESCOLHA';
  }

  if (bodyFatPct >= 30) return 'CUT';
  if (bodyFatPct < 20) return 'BULK';
  return 'LIVRE ESCOLHA';
}

export function calculateWhtr(waistCm: number, heightCm: number): number {
  return waistCm / heightCm;
}

export function calculateAverageWeight7d(weightsKg: number[]): number | null {
  if (weightsKg.length === 0) return null;
  const recent = weightsKg.slice(-7);
  return recent.reduce((sum, value) => sum + value, 0) / recent.length;
}

export function getConfidenceLevel(dailyCount: number, weeklyCount: number): Confidence {
  if (dailyCount >= 28 && weeklyCount >= 4) return 'Alta';
  if (dailyCount >= 7 && weeklyCount >= 2) return 'Moderada';
  return 'Baixa';
}

export function classifyRecommendation(params: {
  whtr: number;
  sex: Sex;
  bodyFatPct?: number;
}): Recommendation {
  const { whtr, sex, bodyFatPct } = params;
  if (whtr >= 0.5) return 'CUT';
  if (whtr < 0.4) return 'BULK';
  if (typeof bodyFatPct === 'number') return decideByBodyFat(sex, bodyFatPct);
  return 'LIVRE ESCOLHA';
}

export function trendForNumbers(values: number[]): Trend | null {
  if (values.length < 2) return null;
  const diff = values[values.length - 1] - values[0];
  if (Math.abs(diff) < 0.2) return 'estavel';
  return diff > 0 ? 'subindo' : 'caindo';
}

export function getRecommendation(state: DomainState): CalculatedState {
  const lastCheckIn = state.weeklyMeasurements[state.weeklyMeasurements.length - 1];
  const avgWeight7d = calculateAverageWeight7d(state.dailyWeights.map((entry) => entry.weightKg));

  const confidence = getConfidenceLevel(state.dailyWeights.length, state.weeklyMeasurements.length);
  const weightTrend = trendForNumbers(state.dailyWeights.slice(-7).map((entry) => entry.weightKg));
  const waistTrend = trendForNumbers(state.weeklyMeasurements.slice(-4).map((entry) => entry.waistCm));

  if (!state.profile || !lastCheckIn) {
    return {
      recommendation: 'LIVRE ESCOLHA',
      reason:
        'Ainda faltam registros para uma leitura mais confiável. Continue preenchendo seu peso diário e sua cintura semanal.',
      explanation: [
        'Sem perfil completo ou sem medição semanal de cintura ainda não existe leitura confiável.',
        'A recomendação fica neutra até que você registre mais dados.'
      ],
      whtr: null,
      confidence,
      avgWeight7d,
      latestWaistCm: lastCheckIn?.waistCm ?? null,
      latestBodyFatPct: lastCheckIn?.bodyFatPct ?? null,
      weightTrend,
      waistTrend
    };
  }

  const whtr = calculateWhtr(lastCheckIn.waistCm, state.profile.heightCm);
  const recommendation = classifyRecommendation({
    whtr,
    sex: state.profile.sex,
    bodyFatPct: lastCheckIn.bodyFatPct
  });

  const isIntermediate = whtr >= 0.4 && whtr < 0.5;
  const usedBodyFat = isIntermediate && typeof lastCheckIn.bodyFatPct === 'number';

  let reason = '';
  let explanation: string[] = [];

  if (recommendation === 'CUT' && whtr >= 0.5) {
    reason = 'Sua cintura está acima da zona considerada confortável em relação à sua altura.';
    explanation = [
      'A razão cintura/altura (WHtR) ficou em 0,50 ou mais.',
      'Pela regra principal, nessa faixa a melhor direção é reduzir gordura antes de ganhar mais peso.'
    ];
  } else if (recommendation === 'BULK' && whtr < 0.4) {
    reason = 'Sua relação cintura/altura está em faixa baixa para priorizar ganho de massa.';
    explanation = [
      'A razão cintura/altura (WHtR) ficou abaixo de 0,40.',
      'Pela regra principal, nessa faixa aumentar massa é uma direção possível.'
    ];
  } else if (usedBodyFat) {
    reason =
      recommendation === 'LIVRE ESCOLHA'
        ? 'Seu WHtR está em faixa intermediária e a gordura corporal também está em zona equilibrada.'
        : 'Seu WHtR está em faixa intermediária e a gordura corporal definiu a direção atual.';
    explanation = [
      'Seu WHtR ficou entre 0,40 e 0,49.',
      'Nessa faixa intermediária, o sistema usa o percentual de gordura para decidir.'
    ];
  } else {
    reason =
      'Seus indicadores estão em faixa intermediária e sem gordura corporal recente. A direção está livre para decidir com seu treinador.';
    explanation = [
      'Seu WHtR ficou entre 0,40 e 0,49.',
      'Sem percentual de gordura recente, a classificação padrão é LIVRE ESCOLHA.'
    ];
  }

  return {
    recommendation,
    reason,
    explanation,
    whtr,
    confidence,
    avgWeight7d,
    latestWaistCm: lastCheckIn.waistCm,
    latestBodyFatPct: lastCheckIn.bodyFatPct ?? null,
    weightTrend,
    waistTrend
  };
}
