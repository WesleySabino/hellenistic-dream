# Hellenistic Dream

Scaffold inicial do **Hellenistic Dream**: aplicação web mobile-first, local-first e sem backend remoto.

## Stack

- React 18
- TypeScript
- Vite

## O que já existe

- Navegação entre telas principais:
  - Dashboard
  - Check-in
  - Histórico
  - Perfil
- Persistência local no navegador com `localStorage`
- Lógica inicial de recomendação (`CUT`, `BULK`, `LIVRE ESCOLHA`) baseada em WHtR e gordura corporal opcional
- Layout mobile-first e interface simples
- Sem autenticação
- Sem backend

## Como rodar localmente

### Pré-requisitos

- Node.js 20+ (recomendado)
- npm 10+ (ou equivalente)

### Passos

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

## Build de produção

```bash
npm run build
npm run preview
```

## Persistência local

Os dados ficam salvos no navegador do usuário em:

- chave `hellenistic-dream/state/v1` do `localStorage`

Nenhum dado corporal é enviado para backend.
