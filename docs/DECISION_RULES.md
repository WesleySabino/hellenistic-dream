# Hellenistic Dream — Decision Rules

## Objetivo

Definir regras objetivas e simples para classificar o usuário em:

- BULK
- CUT
- LIVRE ESCOLHA

## Métricas de entrada

Obrigatórias:
- sexo
- altura em cm
- cintura em cm
- histórico de peso

Opcional:
- percentual de gordura

## Medidas derivadas

### 1. Razão cintura/altura

Formula:
WHtR = cintura_cm / altura_cm

Essa é a métrica principal da decisão.

### 2. Peso médio de 7 dias

Usar a média dos 7 registros de peso mais recentes disponíveis.

Objetivo:
- reduzir ruído diário
- exibir tendência mais estável
- melhorar leitura visual

## Regra principal

### Etapa 1 — usar WHtR

- Se WHtR >= 0.50 -> CUT
- Se WHtR < 0.40 -> BULK
- Se WHtR entre 0.40 e 0.49 -> zona intermediária

### Etapa 2 — usar gordura corporal apenas na zona intermediária

#### Homens
- gordura >= 20% -> CUT
- gordura < 12% -> BULK
- gordura entre 12% e 19% -> LIVRE ESCOLHA

#### Mulheres
- gordura >= 30% -> CUT
- gordura < 20% -> BULK
- gordura entre 20% e 29% -> LIVRE ESCOLHA

### Etapa 3 — sem percentual de gordura na zona intermediária

- Se WHtR estiver entre 0.40 e 0.49
- e não houver percentual de gordura recente
- então a recomendação é LIVRE ESCOLHA

## Regra de precedência

Ordem de prioridade:
1. Se WHtR >= 0.50, recomendar CUT
2. Se WHtR < 0.40, recomendar BULK
3. Se WHtR estiver entre 0.40 e 0.49, usar gordura corporal se existir
4. Se não existir gordura corporal nessa faixa, recomendar LIVRE ESCOLHA

## Nível de confiança

### Baixa
- menos de 7 registros de peso
ou
- menos de 2 medições semanais

### Moderada
- pelo menos 7 registros de peso
e
- pelo menos 2 medições semanais

### Alta
- histórico consistente de pelo menos 4 semanas
- registros diários razoavelmente completos
- medições semanais presentes

## Tendências a mostrar na interface

### Peso
- subindo
- caindo
- estável

### Cintura
- subindo
- caindo
- estável

A tendência deve ser simples e interpretável.

## Restrições de linguagem

O sistema nunca deve dizer:
- diagnóstico
- prescrição
- tratamento

O sistema deve dizer:
- recomendação atual
- leitura dos dados
- indicação do sistema

## Mensagens modelo

### CUT
"Seus dados sugerem que reduzir gordura antes de ganhar mais peso tende a ser a melhor direção."

### BULK
"Seus dados estão em uma faixa em que aumentar massa pode ser uma boa direção."

### LIVRE ESCOLHA
"Seus indicadores estão em uma faixa equilibrada. Você pode decidir junto ao seu treinador se quer priorizar definição ou massa."

### DADOS INSUFICIENTES
"Ainda faltam registros para uma leitura mais confiável. Continue preenchendo seu peso diário e sua cintura semanal."