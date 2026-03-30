import { useState } from 'react';
import type { DailyWeightEntry, WeeklyCheckIn } from '../domain/types';

interface CheckInScreenProps {
  onAddDaily(entry: DailyWeightEntry): void;
  onAddWeekly(entry: WeeklyCheckIn): void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function CheckInScreen({ onAddDaily, onAddWeekly }: CheckInScreenProps) {
  const [dailyDate, setDailyDate] = useState(today());
  const [weightKg, setWeightKg] = useState(80);

  const [weeklyDate, setWeeklyDate] = useState(today());
  const [waistCm, setWaistCm] = useState(85);
  const [bodyFatPct, setBodyFatPct] = useState('');

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
          }}
        >
          <h2>Peso diário</h2>
          <label>
            Data
            <input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} required />
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
          <button type="submit">Salvar peso</button>
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
