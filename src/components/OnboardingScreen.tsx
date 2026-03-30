import { useState } from 'react';
import type { Goal, Sex, UserProfile, WeeklyCheckIn } from '../domain/types';

interface OnboardingPayload {
  profile: UserProfile;
  initialWeightKg: number;
  initialMeasurement: WeeklyCheckIn;
}

interface OnboardingScreenProps {
  onComplete(payload: OnboardingPayload): void;
}

const today = () => new Date().toISOString().slice(0, 10);

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  return Number(raw);
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [waistCm, setWaistCm] = useState('80');
  const [startDate, setStartDate] = useState(today());
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [goal, setGoal] = useState<Goal>('unsure');
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <section className="onboarding-shell">
      <h1>Bem-vindo ao Hellenistic Dream</h1>
      <p className="muted">Vamos configurar sua base inicial. Leva menos de 2 minutos.</p>

      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();

          const nextErrors: string[] = [];
          const parsedHeight = Number(heightCm);
          const parsedWeight = Number(weightKg);
          const parsedWaist = Number(waistCm);
          const parsedBodyFat = parseOptionalNumber(bodyFatPct);

          if (!Number.isFinite(parsedHeight) || parsedHeight < 120 || parsedHeight > 240) {
            nextErrors.push('Informe uma altura válida entre 120 e 240 cm.');
          }

          if (!Number.isFinite(parsedWeight) || parsedWeight < 30 || parsedWeight > 350) {
            nextErrors.push('Informe um peso inicial válido entre 30 e 350 kg.');
          }

          if (!Number.isFinite(parsedWaist) || parsedWaist < 40 || parsedWaist > 250) {
            nextErrors.push('Informe uma cintura inicial válida entre 40 e 250 cm.');
          }

          if (!startDate) {
            nextErrors.push('Escolha a data inicial da medição.');
          }

          if (typeof parsedBodyFat === 'number' && (!Number.isFinite(parsedBodyFat) || parsedBodyFat <= 1 || parsedBodyFat >= 70)) {
            nextErrors.push('Se informar gordura corporal, use um valor entre 1 e 70%.');
          }

          if (nextErrors.length > 0) {
            setErrors(nextErrors);
            return;
          }

          setErrors([]);
          onComplete({
            profile: {
              name: name.trim() || undefined,
              sex,
              heightCm: parsedHeight,
              currentGoal: goal
            },
            initialWeightKg: parsedWeight,
            initialMeasurement: {
              date: startDate,
              waistCm: parsedWaist,
              bodyFatPct: parsedBodyFat
            }
          });
        }}
      >
        {errors.length > 0 && (
          <div className="validation-box" role="alert">
            <p className="label">Confira antes de continuar:</p>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <label>
          Nome (opcional)
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Alex" />
        </label>

        <label>
          Sexo
          <select value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
            <option value="male">Homem</option>
            <option value="female">Mulher</option>
          </select>
        </label>

        <label>
          Altura (cm)
          <input type="number" inputMode="decimal" min={120} max={240} value={heightCm} onChange={(event) => setHeightCm(event.target.value)} required />
        </label>

        <label>
          Peso inicial (kg)
          <input type="number" inputMode="decimal" step="0.1" min={30} max={350} value={weightKg} onChange={(event) => setWeightKg(event.target.value)} required />
        </label>

        <label>
          Cintura inicial (cm)
          <input type="number" inputMode="decimal" step="0.1" min={40} max={250} value={waistCm} onChange={(event) => setWaistCm(event.target.value)} required />
        </label>

        <label>
          Data inicial
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </label>

        <label>
          Gordura corporal inicial (%) (opcional)
          <input type="number" inputMode="decimal" step="0.1" min={1} max={70} value={bodyFatPct} onChange={(event) => setBodyFatPct(event.target.value)} placeholder="Ex.: 18.5" />
        </label>

        <label>
          Objetivo atual (opcional)
          <select value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>
            <option value="gain">Ganhar massa</option>
            <option value="lose">Perder gordura</option>
            <option value="unsure">Ainda não sei</option>
          </select>
        </label>

        <button type="submit">Concluir onboarding</button>
      </form>
    </section>
  );
}
