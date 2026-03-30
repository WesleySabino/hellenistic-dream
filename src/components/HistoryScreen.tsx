import type { AppState } from '../domain/types';

interface HistoryScreenProps {
  state: AppState;
}

export function HistoryScreen({ state }: HistoryScreenProps) {
  return (
    <section>
      <h1>Histórico</h1>
      <p className="muted">Visualização simples dos registros locais.</p>

      <article className="card">
        <h2>Pesos recentes</h2>
        <ul>
          {state.dailyWeights.length === 0 ? (
            <li>Nenhum registro ainda.</li>
          ) : (
            [...state.dailyWeights].reverse().slice(0, 10).map((entry) => (
              <li key={`${entry.date}-${entry.weightKg}`}>
                {entry.date}: {entry.weightKg.toFixed(1)} kg
              </li>
            ))
          )}
        </ul>
      </article>

      <article className="card">
        <h2>Cintura recente</h2>
        <ul>
          {state.weeklyCheckIns.length === 0 ? (
            <li>Nenhum registro ainda.</li>
          ) : (
            [...state.weeklyCheckIns].reverse().slice(0, 10).map((entry) => (
              <li key={`${entry.date}-${entry.waistCm}`}>
                {entry.date}: {entry.waistCm.toFixed(1)} cm
                {typeof entry.bodyFatPct === 'number' ? ` | Gordura: ${entry.bodyFatPct.toFixed(1)}%` : ''}
              </li>
            ))
          )}
        </ul>
      </article>
    </section>
  );
}
