import { getRecommendation } from '../domain/decision';
import type { AppState, Trend } from '../domain/types';

interface DashboardProps {
  state: AppState;
}

function trendLabel(label: string, trend: Trend | null): string {
  if (!trend) return `${label}: sem dados suficientes`;
  if (trend === 'subindo') return `${label}: subindo`;
  if (trend === 'caindo') return `${label}: caindo`;
  return `${label}: estável`;
}

function daysSince(date: string): number {
  const measurementDate = new Date(`${date}T00:00:00Z`);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((now.getTime() - measurementDate.getTime()) / msPerDay);
}

function sparklineData(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.0001);
  return values.map((value) => {
    const normalized = (value - min) / range;
    return Math.max(14, Math.round(14 + normalized * 44));
  });
}

function SparkBars({ values, label }: { values: number[]; label: string }) {
  const heights = sparklineData(values);
  if (heights.length === 0) {
    return <p className="mini-empty">Sem dados para gráfico</p>;
  }

  return (
    <div className="mini-bars" role="img" aria-label={label}>
      {heights.map((height, index) => (
        <span key={`${label}-${index}`} style={{ height }} />
      ))}
    </div>
  );
}

export function Dashboard({ state }: DashboardProps) {
  const {
    recommendation,
    reason,
    explanation,
    whtr,
    confidence,
    avgWeight7d,
    latestWaistCm,
    latestBodyFatPct,
    weightTrend,
    waistTrend
  } = getRecommendation(state);

  const latestWeight = state.dailyWeights[state.dailyWeights.length - 1];
  const latestMeasurement = state.weeklyMeasurements[state.weeklyMeasurements.length - 1];

  const daysWithoutWeight = latestWeight ? daysSince(latestWeight.date) : null;
  const daysWithoutWaist = latestMeasurement ? daysSince(latestMeasurement.date) : null;

  const pendingReminders: string[] = [];
  if (daysWithoutWeight === null || daysWithoutWeight >= 1) {
    pendingReminders.push('Registrar o peso de hoje.');
  }
  if (daysWithoutWaist === null || daysWithoutWaist >= 7) {
    pendingReminders.push('Registrar cintura da semana.');
  }

  const colorClass =
    recommendation === 'CUT' ? 'is-cut' : recommendation === 'BULK' ? 'is-bulk' : 'is-free';

  return (
    <section className="dashboard-shell">
      <h1>Hellenistic Dream</h1>
      <p className="muted">App local-first: seus dados ficam no seu navegador.</p>

      <article className={`recommendation hero ${colorClass}`}>
        <p className="label">Recomendação atual</p>
        <h2>{recommendation}</h2>
        <p className="reason">{reason}</p>
        <ul>
          {explanation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </article>

      <div className="metrics-grid">
        <article className="card">
          <p className="label">Confiança da leitura</p>
          <strong>{confidence}</strong>
        </article>
        <article className="card">
          <p className="label">Peso médio (7 dias)</p>
          <strong>{avgWeight7d !== null ? `${avgWeight7d.toFixed(1)} kg` : 'Sem dados'}</strong>
        </article>
        <article className="card">
          <p className="label">Cintura atual</p>
          <strong>{latestWaistCm !== null ? `${latestWaistCm.toFixed(1)} cm` : 'Sem dados'}</strong>
        </article>
        <article className="card">
          <p className="label">WHtR atual</p>
          <strong>{whtr !== null ? whtr.toFixed(2) : 'Sem dados'}</strong>
        </article>
        <article className="card">
          <p className="label">Gordura corporal</p>
          <strong>{latestBodyFatPct !== null ? `${latestBodyFatPct.toFixed(1)}%` : 'Não informada'}</strong>
        </article>
      </div>

      <article className="card">
        <p className="label">Pendências</p>
        {pendingReminders.length === 0 ? (
          <p>Sem pendências no momento. Ótima consistência!</p>
        ) : (
          <ul>
            {pendingReminders.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </article>

      <article className="card">
        <p className="label">Tendência resumida</p>
        <div className="trend-list">
          <p>{trendLabel('Peso (7 dias)', weightTrend)}</p>
          <p>{trendLabel('Cintura (4 semanas)', waistTrend)}</p>
        </div>
      </article>

      <div className="metrics-grid">
        <article className="card">
          <p className="label">Mini gráfico de peso</p>
          <SparkBars
            values={state.dailyWeights.slice(-14).map((entry) => entry.weightKg)}
            label="Tendência de peso recente"
          />
        </article>

        <article className="card">
          <p className="label">Mini gráfico de cintura</p>
          <SparkBars
            values={state.weeklyMeasurements.slice(-8).map((entry) => entry.waistCm)}
            label="Tendência de cintura recente"
          />
        </article>
      </div>
    </section>
  );
}
