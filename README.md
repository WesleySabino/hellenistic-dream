# Hellenistic Dream

Hellenistic Dream é uma aplicação web local-first para acompanhar a evolução corporal do usuário e indicar, de forma simples, se a direção mais apropriada no momento é:

- BULK
- CUT
- LIVRE ESCOLHA

## Objetivo do produto

A aplicação foi pensada para uso conjunto entre usuário e personal trainer.
Ela deve funcionar muito bem em navegador de celular, com linguagem simples e visual clara.

## Restrições obrigatórias

- Sem backend remoto
- Sem autenticação
- Sem conta de usuário
- Nenhum dado corporal deve ser enviado ao servidor
- Todos os dados do usuário ficam armazenados localmente no navegador
- O site remoto só entrega a interface e o código; o cálculo ocorre localmente no cliente

## Prioridades de UX

- Mobile-first
- Interface clara para leigos
- Gráficos simples
- Linguagem não médica
- Fluxo rápido para registrar peso diário
- Fluxo simples para registrar cintura semanal

## Fonte de verdade do projeto

Leia estes arquivos antes de qualquer implementação:

1. `docs/FULL_SPEC.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/DECISION_RULES.md`

## Escopo do MVP

- onboarding inicial
- dashboard principal
- registro diário de peso
- registro semanal de cintura
- cálculo de recomendação BULK / CUT / LIVRE ESCOLHA
- histórico visual
- exportação e importação local de dados
- funcionamento sem backend

## Stack desejado

Preferência inicial:
- React
- TypeScript
- mobile-first
- arquitetura simples
- armazenamento local encapsulado
- componentes pequenos e legíveis
- lógica de negócio separada da UI

## Regras para o agente

- Leia a documentação antes de editar código
- Trabalhe por etapas pequenas
- Não implemente backend
- Não adicione autenticação
- Não envie dados do usuário para APIs remotas
- Separe regra de negócio da camada de componentes
- Escreva código legível e fácil de manter
- Sempre documente como rodar localmente

## Critério geral de qualidade

O projeto deve ser simples o bastante para um desenvolvedor individual manter, mas organizado o bastante para crescer depois.