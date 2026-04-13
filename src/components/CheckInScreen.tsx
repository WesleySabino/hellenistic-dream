import { useEffect, useMemo, useState } from 'react';
import { calculateAverageWeight7d } from '../domain/decision';
import type { DailyWeightEntry, WeeklyCheckIn } from '../domain/types';

interface CheckInScreenProps {
  onAddDaily(entry: DailyWeightEntry): void;
  onAddWeekly(entry: WeeklyCheckIn): void;
  dailyWeights: DailyWeightEntry[];
}

const today = () => new Date().toISOString().slice(0, 10);

export function CheckInScreen({ onAddDaily, onAddWeekly, dailyWeights }: CheckInScreenProps) {
  const [dailyDate, setDailyDate] = useState(today());
  const [weightKg, setWeightKg] = useState(80);
  const [dailySuccessMessage, setDailySuccessMessage] = useState('');

  const [weeklyDate, setWeeklyDate] = useState(today());
  const [waistCm, setWaistCm] = useState(85);
  const [bodyFatPct, setBodyFatPct] = useState('');

  const existingDailyEntry = useMemo(
    () => dailyWeights.find((entry) => entry.date === dailyDate),
    [dailyDate, dailyWeights]
  );

  useEffect(() => {
    if (existingDailyEntry) {
      setWeightKg(existingDailyEntry.weightKg);
    }
  }, [existingDailyEntry]);

  const recentAvgWeight7d = useMemo(() => {
    return calculateAverageWeight7d(dailyWeights.map((entry) => entry.weightKg));
  }, [dailyWeights]);

  return (
    <section>
      <h1>Check-ins</h1>
      <p className="muted">Registre seu peso diariamente e sua cintura semanalmente.</p>

      <div className="metrics-grid">
        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault();
            onAddDaily({ date: dailyDate, weightKg });
            setDailySuccessMessage('Peso salvo com sucesso. Média de 7 dias recalculada.');
          }}
        >
          <h2>Peso diário</h2>
          <label>
            Data
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => {
                const nextDate = e.target.value;
                setDailyDate(nextDate);
                const entryForDate = dailyWeights.find((entry) => entry.date === nextDate);
                if (entryForDate) {
                  setWeightKg(entryForDate.weightKg);
                }
                setDailySuccessMessage('');
              }}
              required
            />
          </label>
          <label>
            Peso (kg)
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              required
            />
          </label>
          {existingDailyEntry ? (
            <p className="muted">Já existe peso nessa data. Salvar irá editar o registro do dia.</p>
          ) : null}
          {dailySuccessMessage ? <p className="success-feedback">{dailySuccessMessage}</p> : null}
          <p className="muted">
            Média atual de 7 dias:{' '}
            {recentAvgWeight7d !== null ? `${recentAvgWeight7d.toFixed(1)} kg` : 'aguardando registros'}
          </p>
          <button type="submit">{existingDailyEntry ? 'Atualizar peso' : 'Salvar peso'}</button>
        </form>

        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault();
            onAddWeekly({
              date: weeklyDate,
              waistCm,
              bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined
            });
          }}
        >
          <h2>Cintura semanal</h2>
          <label>
            Data
            <input type="date" value={weeklyDate} onChange={(e) => setWeeklyDate(e.target.value)} required />
          </label>
          <label>
            Cintura (cm)
            <input
              type="number"
              step="0.1"
              value={waistCm}
              onChange={(e) => setWaistCm(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Gordura corporal (%) (opcional)
            <input
              type="number"
              step="0.1"
              value={bodyFatPct}
              onChange={(e) => setBodyFatPct(e.target.value)}
            />
          </label>
          <button type="submit">Salvar cintura</button>
        </form>
      </div>
    </section>
  );
}
