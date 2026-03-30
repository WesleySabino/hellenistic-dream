# Hellenistic Dream — Project Brief

## Resumo

Hellenistic Dream é um app web local-first de musculação que acompanha peso diário e cintura semanal para sugerir uma direção atual:

- BULK
- CUT
- LIVRE ESCOLHA

O app será usado por usuários leigos, normalmente com apoio de personal trainer.

## Público

- praticantes de musculação
- usuários leigos em composição corporal
- personal trainers que querem uma leitura rápida da fase atual do aluno

## Proposta de valor

O app transforma dados simples medidos em casa em uma recomendação visual clara e fácil de discutir.

## Princípios do produto

- simples de usar
- simples de manter
- sem backend remoto
- privacidade por padrão
- cálculo local no navegador
- mobile-first
- linguagem acessível

## Entradas principais

Obrigatórias:
- sexo
- altura
- peso
- cintura

Opcional:
- percentual de gordura

## Frequência dos registros

- peso: diariamente
- cintura: semanalmente
- gordura corporal: opcional, quando disponível

## Saídas principais

- recomendação atual
- explicação da decisão
- gráficos de tendência
- nível de confiança da leitura

## Estados da recomendação

- CUT
- BULK
- LIVRE ESCOLHA

## Estados de confiança

- baixa
- moderada
- alta

## Restrições técnicas

- sem login
- sem nuvem para dados corporais
- dados persistidos localmente no navegador
- aplicação deve continuar simples
- evitar dependências desnecessárias
- lógica central testável

## MVP

- onboarding
- dashboard
- check-in diário de peso
- check-in semanal de cintura
- cálculo da fase
- histórico visual
- explicação da recomendação
- exportação/importação local