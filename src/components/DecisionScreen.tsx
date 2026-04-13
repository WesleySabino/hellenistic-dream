import { getRecommendation } from '../domain/decision';
import type { AppState } from '../domain/types';

interface DecisionScreenProps {
  state: AppState;
}

function sexLabel(sex: 'male' | 'female'): string {
  return sex === 'male' ? 'Homem' : 'Mulher';
}

export function DecisionScreen({ state }: DecisionScreenProps) {
  const {
    recommendation,
    reason,
    appliedRule,
    fullRule,
    whtr,
    latestWaistCm,
    latestBodyFatPct
  } = getRecommendation(state);

  const profile = state.profile;

  if (!profile) {
    return (
      <section className="dashboard-shell">
        <h1>Como o sistema decidiu</h1>
        <article className="card">
          <p>Ainda faltam dados de perfil para explicar a decisão.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="dashboard-shell">
      <h1>Como o sistema decidiu</h1>
      <p className="muted">Leitura simplificada para você entender a recomendação atual.</p>

      <article className="card">
        <p className="label">Classificação atual</p>
        <h2>{recommendation}</h2>
      </article>

      <article className="card">
        <p className="label">Dados usados</p>
        <ul>
          <li>Sexo: {sexLabel(profile.sex)}</li>
          <li>Altura: {profile.heightCm.toFixed(1)} cm</li>
          <li>Cintura mais recente: {latestWaistCm !== null ? `${latestWaistCm.toFixed(1)} cm` : 'Sem dados'}</li>
          <li>
            Gordura corporal mais recente:{' '}
            {latestBodyFatPct !== null ? `${latestBodyFatPct.toFixed(1)}%` : 'Não informada'}
          </li>
        </ul>
      </article>

      <article className="card">
        <p className="label">WHtR (cintura/altura)</p>
        <p>
          Fórmula: cintura ÷ altura ={' '}
          {latestWaistCm !== null ? `${latestWaistCm.toFixed(1)} ÷ ${profile.heightCm.toFixed(1)}` : 'sem cintura registrada'}
        </p>
        <strong>{whtr !== null ? whtr.toFixed(3) : 'Sem cálculo disponível'}</strong>
      </article>

      <article className="card">
        <p className="label">Regra aplicada</p>
        <p>{appliedRule}</p>
      </article>

      <article className="card">
        <p className="label">Explicação em linguagem simples</p>
        <p>{reason}</p>
      </article>

      <article className="card">
        <details>
          <summary>Ver regra completa</summary>
          <ul className="rule-list">
            {fullRule.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      </article>
    </section>
  );
}
