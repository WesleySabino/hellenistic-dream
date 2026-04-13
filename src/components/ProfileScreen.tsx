import { useRef, useState } from 'react';
import type { Goal, Sex, UserProfile } from '../domain/types';

interface ProfileScreenProps {
  profile: UserProfile | null;
  onSave(profile: UserProfile): void;
  onExportJson(): void;
  onExportCsv(): void;
  onImportBackup(file: File): Promise<void>;
  onReset(): void;
}

export function ProfileScreen({
  profile,
  onSave,
  onExportJson,
  onExportCsv,
  onImportBackup,
  onReset
}: ProfileScreenProps) {
  const [name, setName] = useState(profile?.name ?? '');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ?? 170);
  const [goal, setGoal] = useState<Goal>(profile?.currentGoal ?? 'unsure');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

      <section className="card">
        <h2>Backup local</h2>
        <p className="muted">Exporte seus dados para JSON ou CSV e importe backups manuais quando precisar.</p>
        <div className="stack">
          <button type="button" className="ghost-inline" onClick={onExportJson}>
            Exportar JSON
          </button>
          <button type="button" className="ghost-inline" onClick={onExportCsv}>
            Exportar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              if (!window.confirm('Importar backup substituirá os dados atuais. Deseja continuar?')) {
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
              }

              void onImportBackup(file)
                .then(() => {
                  setImportFeedback('Backup importado com sucesso.');
                })
                .catch((error: unknown) => {
                  setImportFeedback(error instanceof Error ? error.message : 'Falha ao importar backup.');
                })
                .finally(() => {
                  if (fileInputRef.current) fileInputRef.current.value = '';
                });
            }}
          />
          {importFeedback ? <p className="muted">{importFeedback}</p> : null}
        </div>
      </section>

      <section className="card">
        <h2>Zona de risco</h2>
        <p className="muted">Isso apagará todos os seus dados armazenados neste navegador.</p>
        <button
          type="button"
          className="danger-inline"
          onClick={() => {
            if (!window.confirm('Tem certeza que deseja apagar todos os dados locais?')) return;
            onReset();
          }}
        >
          Reset total
        </button>
      </section>
    </section>
  );
}
