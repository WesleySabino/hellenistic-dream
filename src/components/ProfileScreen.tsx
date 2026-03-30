import { useState } from 'react';
import type { Goal, Sex, UserProfile } from '../domain/types';

interface ProfileScreenProps {
  profile: UserProfile | null;
  onSave(profile: UserProfile): void;
}

export function ProfileScreen({ profile, onSave }: ProfileScreenProps) {
  const [name, setName] = useState(profile?.name ?? '');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ?? 170);
  const [goal, setGoal] = useState<Goal>(profile?.currentGoal ?? 'unsure');

  return (
    <section>
      <h1>Perfil inicial</h1>
      <p className="muted">Preencha seus dados básicos para iniciar o acompanhamento.</p>

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            name: name || undefined,
            sex,
            heightCm,
            currentGoal: goal
          });
        }}
      >
        <label>
          Nome (opcional)
          <input value={name} onChange={(event) => setName(event.target.value)} />
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
          <input
            type="number"
            min={120}
            max={240}
            value={heightCm}
            onChange={(event) => setHeightCm(Number(event.target.value))}
            required
          />
        </label>

        <label>
          Objetivo atual
          <select value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>
            <option value="gain">Ganhar massa</option>
            <option value="lose">Perder gordura</option>
            <option value="unsure">Ainda não sei</option>
          </select>
        </label>

        <button type="submit">Salvar perfil</button>
      </form>
    </section>
  );
}
