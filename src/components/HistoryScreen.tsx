import { useMemo, useState } from 'react';
import { calculateAverageWeight7d, calculateWhtr, classifyRecommendation } from '../domain/decision';
import type { AppState, DailyWeight, Recommendation, WeeklyMeasurement } from '../domain/types';

interface HistoryScreenProps {
  state: AppState;
  onUpdateDailyWeight: (entry: DailyWeight) => void;
  onDeleteDailyWeight: (date: string) => void;
  onUpdateWeeklyMeasurement: (entry: WeeklyMeasurement) => void;
  onDeleteWeeklyMeasurement: (date: string) => void;
}

interface ChartPoint {
  date: string;
  value: number;
}

interface RecommendationTimelineItem {
  date: string;
  recommendation: Recommendation;
  detail: string;
}

const recommendationLabel: Record<Recommendation, string> = {
  CUT: 'Cut',
  BULK: 'Bulk',
  'LIVRE ESCOLHA': 'Livre escolha'
};

function getRecommendationClass(recommendation: Recommendation) {
  if (recommendation === 'CUT') return 'timeline-cut';
  if (recommendation === 'BULK') return 'timeline-bulk';
  return 'timeline-free';
}

function formatDate(value: string): string {
  const parsed = new Date(`${value}T12:00:00`);
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function SimpleLineChart({
  title,
  subtitle,
  points,
  secondaryPoints,
  valueSuffix,
  secondaryLabel
}: {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  secondaryPoints?: ChartPoint[];
  valueSuffix: string;
  secondaryLabel?: string;
}) {
  if (points.length === 0) {
    return (
      <article className="card">
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
        <p className="empty-state">Sem dados ainda. Faça seus check-ins para começar a visualizar o histórico.</p>
      </article>
    );
  }

  const width = 100;
  const height = 44;
  const paddingX = 5;
  const paddingY = 5;

  const combinedValues = [...points, ...(secondaryPoints ?? [])].map((item) => item.value);
  const min = Math.min(...combinedValues);
  const max = Math.max(...combinedValues);
  const range = Math.max(max - min, 0.1);

  const toXY = (list: ChartPoint[]) =>
    list.map((item, index) => {
      const x = list.length <= 1 ? width / 2 : paddingX + (index / (list.length - 1)) * (width - paddingX * 2);
      const y = paddingY + ((max - item.value) / range) * (height - paddingY * 2);
      return { x, y };
    });

  const primaryPoints = toXY(points);
  const secondaryLinePoints = secondaryPoints ? toXY(secondaryPoints) : [];
  const primaryPath = buildLinePath(primaryPoints);
  const secondaryPath = buildLinePath(secondaryLinePoints);

  const recent = points.slice(-3);

  return (
    <article className="card">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>

      <div className="chart-shell" role="img" aria-label={`Gráfico de ${title}`}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="chart-svg">
          <path d={primaryPath} className="chart-line-primary" />
          {secondaryPath ? <path d={secondaryPath} className="chart-line-secondary" /> : null}
        </svg>
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend-dot primary" /> série principal
        </span>
        {secondaryLabel ? (
          <span>
            <i className="legend-dot secondary" /> {secondaryLabel}
          </span>
        ) : null}
      </div>

      <ul className="compact-list">
        {recent.map((item) => (
          <li key={`${item.date}-${item.value}`}>
            <strong>{formatDate(item.date)}:</strong> {item.value.toFixed(1)} {valueSuffix}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function HistoryScreen({
  state,
  onDeleteDailyWeight,
  onDeleteWeeklyMeasurement,
  onUpdateDailyWeight,
  onUpdateWeeklyMeasurement
}: HistoryScreenProps) {
  const [editingDailyDate, setEditingDailyDate] = useState<string | null>(null);
  const [editingDailyWeight, setEditingDailyWeight] = useState('');

  const [editingWeeklyDate, setEditingWeeklyDate] = useState<string | null>(null);
  const [editingWeeklyWaist, setEditingWeeklyWaist] = useState('');
  const [editingWeeklyBodyFat, setEditingWeeklyBodyFat] = useState('');

  const dailyWithAverage = useMemo(() => {
    return state.dailyWeights.map((item, index, list) => {
      const window = list.slice(Math.max(0, index - 6), index + 1).map((entry) => entry.weightKg);
      return {
        date: item.date,
        weightKg: item.weightKg,
        avg7d: calculateAverageWeight7d(window)
      };
    });
  }, [state.dailyWeights]);

  const weightPoints = dailyWithAverage.map((item) => ({ date: item.date, value: item.weightKg }));
  const weightAvgPoints = dailyWithAverage
    .filter((item) => typeof item.avg7d === 'number')
    .map((item) => ({ date: item.date, value: item.avg7d as number }));

  const waistPoints = state.weeklyMeasurements.map((item) => ({ date: item.date, value: item.waistCm }));

  const timeline = useMemo<RecommendationTimelineItem[]>(() => {
    const profile = state.profile;
    if (!profile) return [];

    return state.weeklyMeasurements.map((measurement) => {
      const whtr = calculateWhtr(measurement.waistCm, profile.heightCm);
      const recommendation = classifyRecommendation({
        whtr,
        sex: profile.sex,
        bodyFatPct: measurement.bodyFatPct
      });

      return {
        date: measurement.date,
        recommendation,
        detail: `WHtR ${whtr.toFixed(2)}${typeof measurement.bodyFatPct === 'number' ? ` • gordura ${measurement.bodyFatPct.toFixed(1)}%` : ''}`
      };
    });
  }, [state.profile, state.weeklyMeasurements]);

  return (
    <section>
      <h1>Histórico</h1>
      <p className="muted">Acompanhe tendência, classificação ao longo do tempo e gerencie seus registros.</p>

      <SimpleLineChart
        title="Peso diário"
        subtitle="Linha principal de peso e média móvel de 7 dias para reduzir ruído diário."
        points={weightPoints}
        secondaryPoints={weightAvgPoints}
        valueSuffix="kg"
        secondaryLabel="média móvel 7d"
      />

      <SimpleLineChart
        title="Cintura semanal"
        subtitle="Medições de cintura para acompanhamento da evolução corporal."
        points={waistPoints}
        valueSuffix="cm"
      />

      <article className="card">
        <h2>Linha do tempo de classificação</h2>
        {timeline.length === 0 ? (
          <p className="empty-state">Sem medições semanais ainda. Assim que houver cintura registrada, a linha do tempo aparece aqui.</p>
        ) : (
          <ol className="timeline-list">
            {[...timeline].reverse().map((item) => (
              <li key={`${item.date}-${item.recommendation}`}>
                <span className={`timeline-badge ${getRecommendationClass(item.recommendation)}`}>
                  {recommendationLabel[item.recommendation]}
                </span>
                <div>
                  <strong>{formatDate(item.date)}</strong>
                  <p className="muted">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </article>

      <article className="card">
        <h2>Registros de peso</h2>
        {state.dailyWeights.length === 0 ? (
          <p className="empty-state">Nenhum peso registrado ainda.</p>
        ) : (
          <ul className="records-list">
            {[...state.dailyWeights].reverse().map((entry) => (
              <li key={entry.date}>
                {editingDailyDate === entry.date ? (
                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const parsed = Number(editingDailyWeight.replace(',', '.'));
                      if (!Number.isFinite(parsed) || parsed <= 0) return;
                      onUpdateDailyWeight({ ...entry, weightKg: parsed });
                      setEditingDailyDate(null);
                      setEditingDailyWeight('');
                    }}
                  >
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      value={editingDailyWeight}
                      onChange={(event) => setEditingDailyWeight(event.target.value)}
                      aria-label={`Editar peso em ${entry.date}`}
                      required
                    />
                    <div className="row-actions">
                      <button type="submit">Salvar</button>
                      <button type="button" className="ghost-inline" onClick={() => setEditingDailyDate(null)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <strong>{formatDate(entry.date)}</strong>
                      <p className="muted">{entry.weightKg.toFixed(1)} kg</p>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="ghost-inline"
                        onClick={() => {
                          setEditingDailyDate(entry.date);
                          setEditingDailyWeight(entry.weightKg.toString());
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" className="danger-inline" onClick={() => onDeleteDailyWeight(entry.date)}>
                        Apagar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="card">
        <h2>Registros de cintura</h2>
        {state.weeklyMeasurements.length === 0 ? (
          <p className="empty-state">Nenhuma cintura registrada ainda.</p>
        ) : (
          <ul className="records-list">
            {[...state.weeklyMeasurements].reverse().map((entry) => (
              <li key={entry.date}>
                {editingWeeklyDate === entry.date ? (
                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const waist = Number(editingWeeklyWaist.replace(',', '.'));
                      const bodyFatValue = editingWeeklyBodyFat.trim();
                      const bodyFat = bodyFatValue ? Number(bodyFatValue.replace(',', '.')) : undefined;

                      if (!Number.isFinite(waist) || waist <= 0) return;
                      if (bodyFatValue && (!Number.isFinite(bodyFat) || (bodyFat as number) <= 0)) return;

                      onUpdateWeeklyMeasurement({
                        ...entry,
                        waistCm: waist,
                        bodyFatPct: bodyFat
                      });

                      setEditingWeeklyDate(null);
                      setEditingWeeklyWaist('');
                      setEditingWeeklyBodyFat('');
                    }}
                  >
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      value={editingWeeklyWaist}
                      onChange={(event) => setEditingWeeklyWaist(event.target.value)}
                      aria-label={`Editar cintura em ${entry.date}`}
                      required
                    />
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      placeholder="Gordura corporal (%) opcional"
                      value={editingWeeklyBodyFat}
                      onChange={(event) => setEditingWeeklyBodyFat(event.target.value)}
                      aria-label={`Editar gordura corporal em ${entry.date}`}
                    />
                    <div className="row-actions">
                      <button type="submit">Salvar</button>
                      <button type="button" className="ghost-inline" onClick={() => setEditingWeeklyDate(null)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <strong>{formatDate(entry.date)}</strong>
                      <p className="muted">
                        {entry.waistCm.toFixed(1)} cm
                        {typeof entry.bodyFatPct === 'number' ? ` • Gordura ${entry.bodyFatPct.toFixed(1)}%` : ''}
                      </p>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="ghost-inline"
                        onClick={() => {
                          setEditingWeeklyDate(entry.date);
                          setEditingWeeklyWaist(entry.waistCm.toString());
                          setEditingWeeklyBodyFat(entry.bodyFatPct?.toString() ?? '');
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" className="danger-inline" onClick={() => onDeleteWeeklyMeasurement(entry.date)}>
                        Apagar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
