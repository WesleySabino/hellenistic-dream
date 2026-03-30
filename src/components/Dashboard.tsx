import type { AppState } from '../domain/types';
import { getRecommendation } from '../domain/decision';

interface DashboardProps {
  state: AppState;
}

export function Dashboard({ state }: DashboardProps) {
  const { recommendation, reason, explanation, whtr, confidence, avgWeight7d } = getRecommendation(state);
  const lastCheckIn = state.weeklyMeasurements[state.weeklyMeasurements.length - 1];
  const colorClass =
    recommendation === 'CUT' ? 'is-cut' : recommendation === 'BULK' ? 'is-bulk' : 'is-free';

  return (
    <section>
      <h1>Hellenistic Dream</h1>
      <p className="muted">App local-first: seus dados ficam no seu navegador.</p>

      <article className={`recommendation ${colorClass}`}>
        <p className="label">Recomendação atual</p>
        <h2>{recommendation}</h2>
        <p>{reason}</p>
        <ul>
          {explanation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </article>

      <div className="metrics-grid">
        <article className="card">
          <p className="label">Confiança</p>
          <strong>{confidence}</strong>
        </article>
        <article className="card">
          <p className="label">Peso médio (7 dias)</p>
          <strong>{avgWeight7d ? `${avgWeight7d.toFixed(1)} kg` : 'Sem dados'}</strong>
        </article>
        <article className="card">
          <p className="label">Cintura atual</p>
          <strong>{lastCheckIn ? `${lastCheckIn.waistCm.toFixed(1)} cm` : 'Sem dados'}</strong>
        </article>
        <article className="card">
          <p className="label">WHtR</p>
          <strong>{whtr ? whtr.toFixed(2) : 'Sem dados'}</strong>
        </article>
      </div>
    </section>
  );
}
