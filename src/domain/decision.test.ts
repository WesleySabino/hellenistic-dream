import { describe, expect, it } from 'vitest';

import {
  calculateAverageWeight7d,
  calculateWhtr,
  classifyRecommendation,
  getConfidenceLevel,
  getRecommendation,
  trendForNumbers
} from './decision';
import type { DomainState } from './types';

describe('decision helpers', () => {
  it('calcula WHtR corretamente', () => {
    expect(calculateWhtr(90, 180)).toBe(0.5);
  });

  it('calcula média de peso com até 7 dias mais recentes', () => {
    expect(calculateAverageWeight7d([])).toBeNull();
    expect(calculateAverageWeight7d([80, 81, 82])).toBe(81);
    expect(calculateAverageWeight7d([70, 71, 72, 73, 74, 75, 76, 77])).toBe(74);
  });

  it('classifica por precedência de WHtR antes da gordura', () => {
    expect(classifyRecommendation({ whtr: 0.52, sex: 'male', bodyFatPct: 8 })).toBe('CUT');
    expect(classifyRecommendation({ whtr: 0.38, sex: 'female', bodyFatPct: 45 })).toBe('BULK');
  });

  it('usa gordura corporal na zona intermediária', () => {
    expect(classifyRecommendation({ whtr: 0.45, sex: 'male', bodyFatPct: 21 })).toBe('CUT');
    expect(classifyRecommendation({ whtr: 0.45, sex: 'male', bodyFatPct: 10 })).toBe('BULK');
    expect(classifyRecommendation({ whtr: 0.45, sex: 'female', bodyFatPct: 25 })).toBe('LIVRE ESCOLHA');
    expect(classifyRecommendation({ whtr: 0.45, sex: 'female' })).toBe('LIVRE ESCOLHA');
  });

  it('calcula nível de confiança conforme documentação', () => {
    expect(getConfidenceLevel(6, 2)).toBe('Baixa');
    expect(getConfidenceLevel(7, 2)).toBe('Moderada');
    expect(getConfidenceLevel(28, 4)).toBe('Alta');
  });

  it('calcula tendência simples', () => {
    expect(trendForNumbers([70])).toBeNull();
    expect(trendForNumbers([70, 70.1])).toBe('estavel');
    expect(trendForNumbers([70, 71])).toBe('subindo');
    expect(trendForNumbers([71, 70])).toBe('caindo');
  });
});

describe('getRecommendation', () => {
  const baseState: DomainState = {
    profile: { sex: 'male', heightCm: 180 },
    dailyWeights: [
      { date: '2026-03-01', weightKg: 80 },
      { date: '2026-03-02', weightKg: 80.2 },
      { date: '2026-03-03', weightKg: 80.1 },
      { date: '2026-03-04', weightKg: 80.3 },
      { date: '2026-03-05', weightKg: 80.4 },
      { date: '2026-03-06', weightKg: 80.2 },
      { date: '2026-03-07', weightKg: 80.5 }
    ],
    weeklyMeasurements: [{ date: '2026-03-07', waistCm: 90 }]
  };

  it('retorna CUT quando WHtR >= 0.50', () => {
    const result = getRecommendation(baseState);
    expect(result.recommendation).toBe('CUT');
    expect(result.whtr).toBe(0.5);
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('retorna BULK quando WHtR < 0.40', () => {
    const result = getRecommendation({
      ...baseState,
      weeklyMeasurements: [{ date: '2026-03-07', waistCm: 70 }]
    });
    expect(result.recommendation).toBe('BULK');
  });

  it('retorna LIVRE ESCOLHA quando WHtR intermediário sem gordura', () => {
    const result = getRecommendation({
      ...baseState,
      weeklyMeasurements: [{ date: '2026-03-07', waistCm: 81 }]
    });
    expect(result.recommendation).toBe('LIVRE ESCOLHA');
  });

  it('retorna decisão por gordura quando WHtR intermediário com gordura', () => {
    const result = getRecommendation({
      ...baseState,
      weeklyMeasurements: [{ date: '2026-03-07', waistCm: 81, bodyFatPct: 22 }]
    });
    expect(result.recommendation).toBe('CUT');
  });
});
