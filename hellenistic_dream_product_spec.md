# Hellenistic Dream — Especificação de Features

## 1. Visão do produto

**Hellenistic Dream** é uma aplicação web local-first para acompanhamento de composição corporal e decisão de fase de musculação.

Seu objetivo é ajudar o usuário, junto com seu personal trainer, a responder de forma simples e visual:
- **Devo estar em bulk?**
- **Devo estar em cut?**
- **Estou em uma zona confortável em que posso escolher qualquer direção?**

A aplicação deve funcionar bem em **desktop e navegadores de celular**, com interface simples, linguagem leiga e operação totalmente local no navegador.

---

## 2. Princípios do produto

### 2.1. Simplicidade técnica
- Sem back-end remoto.
- Sem conta de usuário.
- Sem login.
- Sem banco de dados remoto.
- Todos os dados ficam **armazenados localmente no navegador**.
- O site é apenas o veículo de entrega da interface e do motor de cálculo local.

### 2.2. Privacidade por padrão
- Nenhum dado corporal do usuário deve ser enviado ao servidor.
- O cálculo da recomendação deve ocorrer 100% no cliente.
- O produto deve comunicar isso com clareza na interface.

### 2.3. Clareza para leigos
- A linguagem deve evitar jargões.
- Em vez de mostrar apenas números, o app deve mostrar interpretações visuais e mensagens curtas.
- O foco é orientar a decisão, não substituir o julgamento do usuário e do personal trainer.

### 2.4. Decisão baseada em métricas objetivas caseiras
O sistema será baseado principalmente em:
- **Altura**
- **Peso diário**
- **Circunferência da cintura semanal**
- **Sexo**
- **Percentual de gordura opcional** (se o usuário quiser informar)

---

## 3. Proposta de valor

### Para o usuário
- Entender a própria evolução sem depender de planilhas.
- Receber uma recomendação simples: **bulk**, **cut** ou **livre escolha**.
- Visualizar tendências de peso e cintura de forma clara.

### Para o personal trainer
- Ter um painel simples para discutir o momento atual do aluno.
- Observar consistência dos registros.
- Usar os dados do app como apoio à decisão, sem cálculos manuais.

---

## 4. Escopo funcional do MVP

O MVP deve ser pequeno e altamente funcional.

### 4.1. Cadastro inicial do perfil
Na primeira utilização, o usuário informa:
- Nome opcional
- Sexo
- Altura (cm)
- Peso inicial (kg)
- Cintura inicial (cm)
- Data da primeira medição
- Percentual de gordura inicial (opcional)
- Objetivo atual opcional:
  - ganhar massa
  - perder gordura
  - ainda não sei

### 4.2. Onboarding educativo
Após preencher os dados iniciais, o sistema deve explicar de forma simples:
- que o peso deve ser atualizado **diariamente**
- que a cintura deve ser atualizada **semanalmente**
- que o percentual de gordura é **opcional**
- que a recomendação do app será recalculada continuamente
- que o app não substitui avaliação profissional

### 4.3. Check-in diário
Todos os dias o usuário pode registrar:
- peso do dia
- observação opcional

Regras:
- o app usa o **peso médio de 7 dias** como base principal de leitura
- o sistema deve destacar quando há poucos registros e a confiança da recomendação ainda é baixa

### 4.4. Check-in semanal
Uma vez por semana, o usuário registra:
- cintura (cm)
- percentual de gordura opcional
- observação opcional

### 4.5. Motor de decisão
O aplicativo deve transformar os dados em uma classificação atual:
- **CUT**
- **BULK**
- **LIVRE ESCOLHA**

#### Lógica base do sistema

##### Etapa 1 — cálculo principal
Calcular a **razão cintura/altura**:

`WHtR = cintura_cm / altura_cm`

##### Etapa 2 — regra principal
- Se **WHtR >= 0,50** → recomendar **CUT**
- Se **WHtR < 0,40** → recomendar **BULK**
- Se **WHtR entre 0,40 e 0,49** → zona intermediária

##### Etapa 3 — refinamento opcional por percentual de gordura
Quando o usuário preencher percentual de gordura:

**Homens**
- gordura >= 20% → **CUT**
- gordura < 12% → **BULK**
- gordura entre 12% e 19% → **LIVRE ESCOLHA**

**Mulheres**
- gordura >= 30% → **CUT**
- gordura < 20% → **BULK**
- gordura entre 20% e 29% → **LIVRE ESCOLHA**

##### Etapa 4 — precedência da decisão
Ordem sugerida:
1. **Se WHtR >= 0,50**, sempre mostrar **CUT**.
2. **Se WHtR < 0,40**, sempre mostrar **BULK**.
3. Se estiver na zona intermediária, usar percentual de gordura se existir.
4. Se estiver na zona intermediária e não houver percentual de gordura, mostrar **LIVRE ESCOLHA**.

### 4.6. Nível de confiança da recomendação
O sistema deve exibir uma etiqueta de confiança:
- **Baixa confiança**: menos de 7 pesos diários e/ou menos de 2 medições de cintura
- **Confiança moderada**: dados mínimos já presentes
- **Alta confiança**: histórico consistente de pelo menos 4 semanas

### 4.7. Painel principal
O painel principal deve mostrar:
- recomendação atual em destaque
- explicação curta do motivo
- peso médio de 7 dias
- última cintura registrada
- WHtR atual
- percentual de gordura atual, se informado
- tendência recente

Exemplo de mensagem:
- **Recomendação atual: CUT**
- **Motivo:** sua cintura está acima da zona considerada confortável em relação à sua altura.

Ou:
- **Recomendação atual: LIVRE ESCOLHA**
- **Motivo:** seus indicadores estão em uma faixa intermediária. Você pode decidir junto ao seu treinador se quer priorizar definição ou ganho de massa.

---

## 5. Features detalhadas

## 5.1. Dashboard visual
O dashboard deve ser a tela principal.

### Componentes:
- Card grande com a recomendação atual
- Semáforo visual:
  - vermelho = cut
  - azul ou verde = bulk
  - amarelo = livre escolha
- Cards secundários com:
  - peso médio 7 dias
  - cintura atual
  - WHtR
  - percentual de gordura
  - consistência dos registros

### Requisitos de UX:
- textos curtos
- números grandes
- leitura fácil em tela pequena
- sem excesso de métricas simultâneas

## 5.2. Histórico de peso
### Função
Mostrar a evolução do peso diário e da média móvel de 7 dias.

### Visualização
- gráfico de linha simples
- linha de peso diário
- linha destacada da média de 7 dias

### Objetivo
Permitir que o usuário e o treinador vejam tendência, não ruído diário.

## 5.3. Histórico de cintura
### Função
Mostrar a evolução da cintura semanal.

### Visualização
- gráfico de linha simples
- pontos semanais conectados
- faixa visual de interpretação por WHtR

## 5.4. Histórico da recomendação
### Função
Mostrar como o app classificou o usuário ao longo do tempo.

### Visualização
- linha do tempo com blocos:
  - bulk
  - cut
  - livre escolha

### Objetivo
Ajudar treinador e aluno a entender mudanças de fase.

## 5.5. Explicador de decisão
Toda recomendação deve ter um bloco “Como chegamos nisso?”.

Esse bloco deve mostrar:
- a regra usada
- os dados mais recentes considerados
- uma explicação curta em linguagem simples

Exemplo:
- Sua cintura atual é 88 cm e sua altura é 175 cm.
- Sua razão cintura/altura é 0,503.
- Isso coloca você acima da faixa intermediária.
- Por isso, a recomendação atual é **CUT**.

## 5.6. Lembretes visuais não intrusivos
Sem notificações push no MVP.

Mas a interface deve lembrar:
- “Você ainda não registrou o peso de hoje.”
- “Está na hora de atualizar sua cintura desta semana.”

## 5.7. Exportação local de dados
Como os dados ficam apenas no navegador, o app deve permitir:
- exportar dados em JSON
- exportar dados em CSV
- importar backup manual

Objetivo:
- evitar perda de dados
- facilitar troca de aparelho
- permitir compartilhamento com personal trainer

## 5.8. Reset local
O usuário deve poder apagar todos os dados locais do app.

Deve existir uma confirmação explícita:
- “Isso apagará todos os seus dados armazenados neste navegador.”

---

## 6. Requisitos de interface

## 6.1. Design geral
O app deve transmitir:
- clareza
- leveza
- disciplina
- estética moderna, limpa e elegante

### Estilo sugerido
- visual minimalista
- poucos elementos por tela
- tipografia grande
- muito espaço em branco
- ícones simples
- gráficos sem poluição visual

## 6.2. Mobile-first
A interface deve ser desenhada primeiro para celular.

### Requisitos:
- menus simples
- botões grandes
- formulários curtos
- gráficos legíveis em largura pequena
- cards empilhados verticalmente

## 6.3. Acessibilidade
- contraste adequado
- não depender apenas de cor para indicar estado
- textos com boa legibilidade
- labels claros em inputs

---

## 7. Estrutura de navegação

## 7.1. Telas principais
1. **Boas-vindas / onboarding**
2. **Dashboard**
3. **Registrar peso**
4. **Registrar cintura**
5. **Histórico**
6. **Explicação da recomendação**
7. **Configurações e backup**

## 7.2. Navegação mobile
Barra inferior com:
- Início
- Peso
- Semanal
- Histórico
- Ajustes

---

## 8. Regras de negócio

## 8.1. Frequência esperada de dados
- Peso: idealmente diário
- Cintura: idealmente semanal
- Gordura corporal: opcional, semanal ou quando disponível

## 8.2. Dados insuficientes
Se não houver dados suficientes, o app não deve “inventar” decisão forte.

Estados possíveis:
- Dados insuficientes
- Recomendação preliminar
- Recomendação consolidada

## 8.3. Recomendação nunca deve soar médica
A interface deve usar linguagem como:
- “recomendação atual”
- “indicação do sistema”
- “interpretação dos seus dados”

Evitar:
- “diagnóstico”
- “tratamento”
- “prescrição”

## 8.4. Decisão compartilhada com treinador
Sempre reforçar que, na zona de livre escolha, a decisão depende de:
- objetivo estético
- desempenho
- aderência
- plano acordado com o treinador

---

## 9. Modelo de dados local

## 9.1. Entidades principais

### Perfil
- id local
- nome
- sexo
- altura_cm
- data_criacao
- objetivo_inicial_opcional

### Pesagens diárias
- data
- peso_kg
- observacao_opcional

### Medições semanais
- data
- cintura_cm
- gordura_percentual_opcional
- observacao_opcional

### Estado calculado
- peso_medio_7_dias
- cintura_atual
- whtr_atual
- gordura_atual_opcional
- recomendacao_atual
- confianca
- data_ultima_atualizacao

## 9.2. Armazenamento
Sugestão:
- `localStorage` para MVP simples
- ou `IndexedDB` se a implementação quiser mais robustez

Recomendação prática:
- MVP pode começar com `localStorage`
- versão seguinte pode migrar para `IndexedDB`

---

## 10. Requisitos não funcionais

## 10.1. Performance
- carregar rápido
- funcionar bem em celulares medianos
- cálculos instantâneos
- gráficos leves

## 10.2. Offline-first
Depois de carregado ao menos uma vez, o app deve idealmente continuar utilizável offline.

## 10.3. Confiabilidade
- não perder dados em navegação comum
- avisar antes de resetar
- permitir backup manual

## 10.4. Segurança e privacidade
- nada de analytics invasivo ligado aos dados corporais
- nenhum envio automático de medições para servidor
- explicar isso na tela de privacidade

---

## 11. Mensagens principais do sistema

## Bulk
“Seus dados estão em uma faixa em que aumentar massa pode ser uma boa direção.”

## Cut
“Seus dados sugerem que reduzir gordura antes de ganhar mais peso tende a ser a melhor direção.”

## Livre escolha
“Seus indicadores estão em uma faixa equilibrada. Você pode decidir junto ao seu treinador se quer priorizar definição ou massa.”

## Dados insuficientes
“Ainda faltam registros para uma leitura confiável. Continue preenchendo seu peso diário e sua cintura semanal.”

---

## 12. Prioridades do MVP

## Essencial
- onboarding
- cadastro inicial
- registro diário de peso
- registro semanal de cintura
- cálculo de recomendação
- dashboard
- gráficos básicos
- armazenamento local
- exportação/importação manual

## Desejável
- percentual de gordura opcional
- nível de confiança
- histórico da recomendação
- explicador de decisão
- modo offline aprimorado

## Futuro
- PWA instalável
- múltiplos perfis no mesmo dispositivo
- modo treinador
- comparação de fases
- metas de taxa de ganho/perda por semana
- registro de fotos locais no dispositivo

---

## 13. Decisões de produto a validar depois

Pontos que ainda podem ser refinados na fase de design/implementação:
- nome final: **Hellenistic Dream**
- paleta visual
- se o percentual de gordura aparece no onboarding ou fica oculto até o usuário ativar
- se a classificação deve usar apenas 3 estados ou incluir “manutenção” como quarto estado
- se o app terá uma tela específica para personal trainer

---

## 14. Resumo executivo

**Hellenistic Dream** será um app web local-first, simples e privativo, voltado a acompanhar peso e cintura para orientar o usuário entre **bulk**, **cut** e **livre escolha**.

Seu diferencial não é complexidade técnica, mas sim:
- simplicidade de uso
- leitura visual clara
- privacidade forte
- apoio prático à conversa entre usuário e personal trainer
- decisão baseada em métricas objetivas que podem ser coletadas em casa

---

## 15. Especificação técnica de telas

Esta seção detalha as telas do produto em nível funcional, com foco em implementação front-end responsiva.

### Convenções gerais de interface

#### Layout base
- Estrutura em coluna única no mobile.
- Largura máxima confortável no desktop, com conteúdo centralizado.
- Espaçamento generoso entre cards.
- Header simples com nome da tela.
- Navegação principal fixa no rodapé no mobile.
- Navegação lateral opcional no desktop.

#### Componentes visuais padrão
- **Card principal** para recomendação atual.
- **Cards secundários** para métricas.
- **Inputs numéricos** com teclado numérico no mobile.
- **Botões primários** para salvar ações.
- **Botões secundários** para editar, cancelar, exportar.
- **Badges** para confiança, status e classificação.
- **Charts** simples e legíveis.

#### Estados padrão por tela
Toda tela deve prever:
- estado vazio
- estado com dados
- estado de erro de validação
- estado de carregamento inicial da aplicação

#### Padrão de linguagem
- frases curtas
- mensagens objetivas
- termos acessíveis
- evitar linguagem médica

---

## 16. Mapa técnico de navegação

### Navegação principal
Itens da barra inferior:
- **Início**
- **Peso**
- **Semanal**
- **Histórico**
- **Ajustes**

### Rotas sugeridas
- `/` → redireciona para onboarding ou dashboard
- `/onboarding`
- `/dashboard`
- `/checkin/peso`
- `/checkin/semanal`
- `/historico`
- `/explicacao`
- `/ajustes`
- `/backup`

---

## 17. Tela de onboarding

### Objetivo
Capturar os dados mínimos para iniciar os cálculos.

### Quando aparece
- primeira vez que o app é aberto
- após reset completo dos dados

### Estrutura
#### Bloco 1 — apresentação
- Nome do produto
- subtítulo explicando a proposta
- mensagem de privacidade local

#### Bloco 2 — formulário inicial
Campos:
- nome opcional
- sexo
- altura em cm
- peso inicial em kg
- cintura inicial em cm
- data da primeira medição
- percentual de gordura opcional
- objetivo inicial opcional

#### Bloco 3 — explicação do uso
Texto curto explicando:
- peso diário
- cintura semanal
- cálculo local
- uso junto ao treinador

#### Bloco 4 — ação principal
- botão: **Começar**

### Componentes
- `TextInput` para nome
- `SegmentedControl` ou `Select` para sexo
- `NumberInput` para altura, peso, cintura, gordura
- `DateInput` para data
- `Select` para objetivo inicial
- `PrimaryButton`

### Validações
- altura obrigatória e maior que zero
- peso obrigatório e maior que zero
- cintura obrigatória e maior que zero
- sexo obrigatório
- gordura opcional, mas se preenchida deve estar em faixa válida

### Regras de UX
- não mostrar muitos textos longos
- exibir erros abaixo do campo
- permitir continuar só com o mínimo necessário

### Saída
Ao salvar:
- criar perfil local
- criar primeira pesagem
- criar primeira medição semanal
- calcular recomendação inicial
- redirecionar para dashboard

---

## 18. Tela de dashboard

### Objetivo
Ser o centro de leitura do app e responder imediatamente o que o usuário precisa saber.

### Estrutura
#### Seção 1 — recomendação atual
Card principal com:
- classificação atual: **BULK**, **CUT** ou **LIVRE ESCOLHA**
- cor de apoio
- frase curta explicativa
- badge de confiança
- botão: **Entender decisão**

#### Seção 2 — métricas atuais
Grid ou lista de cards com:
- peso médio 7 dias
- peso de hoje, se houver
- cintura atual
- WHtR atual
- gordura atual, se disponível

#### Seção 3 — pendências
Bloco de lembretes:
- registrar peso de hoje
- atualizar cintura desta semana

#### Seção 4 — tendência rápida
Mini cards com:
- peso na última semana: subindo / caindo / estável
- cintura no último período: subindo / caindo / estável
- consistência dos registros

#### Seção 5 — gráficos resumidos
- mini gráfico de peso
- mini gráfico de cintura

### Componentes
- `RecommendationCard`
- `MetricCard`
- `ReminderCard`
- `MiniTrendCard`
- `LineChart`
- `Badge`
- `SecondaryButton`

### Estados especiais
#### Sem dados suficientes
Mostrar:
- mensagem de recomendação preliminar
- call to action para completar registros

#### Sem medição semanal recente
Mostrar recomendação com aviso:
- “Atualize sua cintura para uma leitura mais confiável.”

### Ações possíveis
- ir para registrar peso
- ir para registrar semanal
- abrir explicação da recomendação
- abrir histórico

---

## 19. Tela de registro diário de peso

### Objetivo
Permitir registro rápido de peso com o mínimo de atrito.

### Estrutura
#### Seção 1 — resumo
- data atual
- último peso registrado
- média de 7 dias atual

#### Seção 2 — formulário
Campos:
- peso do dia
- observação opcional

#### Seção 3 — ação
- botão: **Salvar peso**

### Componentes
- `NumberInput` com step decimal
- `TextArea` opcional curta
- `PrimaryButton`

### Regras
- se já existir peso para hoje, a interface deve mostrar que o registro será atualizado
- salvar com feedback visual claro

### Validações
- peso deve ser número positivo
- impedir valores absurdos fora de uma faixa plausível configurável

### Pós-salvamento
- recalcular média de 7 dias
- atualizar dashboard
- mostrar toast de sucesso

---

## 20. Tela de registro semanal

### Objetivo
Registrar cintura e, opcionalmente, gordura corporal.

### Estrutura
#### Seção 1 — orientação curta
Explicar em 1 ou 2 linhas como medir cintura de modo consistente.

#### Seção 2 — resumo anterior
- última cintura registrada
- última gordura registrada
- data da última medição semanal

#### Seção 3 — formulário
Campos:
- cintura atual
- percentual de gordura opcional
- observação opcional

#### Seção 4 — ação
- botão: **Salvar medição semanal**

### Componentes
- `NumberInput`
- `TextArea`
- `InfoCallout`
- `PrimaryButton`

### Regras
- se houver mais de uma medição na mesma semana, o sistema pode permitir atualização ou múltiplas entradas, conforme simplicidade do MVP
- recomendação inicial: permitir apenas uma atualização por data, substituindo a anterior

### Validações
- cintura obrigatória e positiva
- gordura opcional, porém validada se preenchida

### Pós-salvamento
- recalcular WHtR
- recalcular decisão
- atualizar confiança
- redirecionar ao dashboard ou permanecer com confirmação

---

## 21. Tela de histórico

### Objetivo
Oferecer leitura histórica clara para usuário e treinador.

### Estrutura por abas ou seções empilhadas
#### Aba 1 — peso
- gráfico de peso diário
- linha de média móvel de 7 dias
- resumo textual da tendência

#### Aba 2 — cintura
- gráfico semanal de cintura
- resumo textual da tendência

#### Aba 3 — classificação
- linha do tempo das fases: bulk, cut, livre escolha
- datas de mudança de classificação

#### Aba 4 — registros
- lista cronológica de entradas
- opção de editar ou apagar registro

### Componentes
- `Tabs`
- `LineChart`
- `Timeline`
- `DataList`
- `IconButton` para editar/apagar

### Estados
- sem histórico ainda
- histórico parcial
- histórico completo com filtros simples

### Filtros desejáveis
- 7 dias
- 30 dias
- 90 dias
- todo período

---

## 22. Tela de explicação da recomendação

### Objetivo
Mostrar com transparência como o sistema chegou à recomendação atual.

### Estrutura
#### Seção 1 — resultado atual
- classificação atual em destaque
- confiança

#### Seção 2 — dados usados
- altura
- cintura mais recente
- WHtR calculado
- gordura mais recente, se houver
- peso médio 7 dias

#### Seção 3 — regra aplicada
Exibir em linguagem humana:
- “Sua razão cintura/altura foi calculada dividindo sua cintura pela sua altura.”
- “Como esse valor ficou acima de 0,50, o sistema recomenda CUT.”

#### Seção 4 — regra técnica expandível
Bloco expansível com a lógica objetiva:
- faixas de WHtR
- faixas de gordura opcional por sexo
- regra de precedência

#### Seção 5 — nota de uso
Mensagem reforçando que o app apoia a conversa com o treinador.

### Componentes
- `ExplanationCard`
- `Accordion`
- `MetricList`
- `Badge`

---

## 23. Tela de ajustes

### Objetivo
Permitir edição de perfil e configurações básicas do app.

### Seções
#### Perfil
- nome
- sexo
- altura
- objetivo inicial

#### Preferências
- unidade de medida futura, se houver expansão
- tema claro/escuro, se implementado

#### Dados
- exportar dados
- importar backup
- apagar dados

#### Privacidade
- texto curto explicando armazenamento local

### Componentes
- `FormSection`
- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`

### Cuidados
- alterar altura deve recalcular WHtR de todos os registros derivados
- ações destrutivas pedem confirmação explícita

---

## 24. Tela de backup e restauração

### Objetivo
Dar segurança ao usuário em um app sem conta e sem nuvem.

### Estrutura
#### Exportação
- botão: exportar JSON
- botão: exportar CSV
- explicação do que cada formato serve

#### Importação
- seletor de arquivo
- preview simples de quantos registros serão importados
- botão confirmar importação

#### Avisos
- importar pode substituir ou mesclar dados
- no MVP, recomendação: substituir totalmente para simplificar

### Componentes
- `FileInput`
- `ActionCard`
- `ConfirmationModal`

---

## 25. Componentes reutilizáveis essenciais

### RecommendationCard
Props sugeridas:
- `status`
- `reason`
- `confidence`
- `ctaLabel`
- `onCtaClick`

### MetricCard
Props:
- `label`
- `value`
- `subtext`
- `trend`

### ReminderCard
Props:
- `title`
- `description`
- `actionLabel`
- `onAction`

### ConfidenceBadge
Valores:
- baixa
- moderada
- alta

### TrendBadge
Valores:
- subindo
- caindo
- estável

### EmptyState
Props:
- `title`
- `description`
- `actionLabel`

---

## 26. Estados da aplicação

### Estado 1 — novo usuário
- sem perfil
- redireciona para onboarding

### Estado 2 — perfil criado, poucos dados
- dashboard com recomendação preliminar
- ênfase em completar registros

### Estado 3 — uso regular
- dashboard completo
- gráficos ativos
- confiança moderada ou alta

### Estado 4 — dados ausentes ou desatualizados
- sistema mantém última recomendação com aviso de desatualização

---

## 27. Especificação dos gráficos

### Gráfico de peso
Objetivo:
- mostrar ruído diário versus tendência real

Séries:
- peso diário
- média móvel de 7 dias

Interações:
- toque ou hover mostra valor e data

### Gráfico de cintura
Objetivo:
- mostrar tendência semanal

Séries:
- cintura semanal

Interações:
- toque ou hover mostra valor e data

### Linha do tempo de classificação
Objetivo:
- mostrar em quais períodos o usuário esteve em bulk, cut ou livre escolha

Representação:
- segmentos coloridos por intervalo temporal

### Requisitos gráficos
- sem excesso de legenda
- sem múltiplos eixos desnecessários
- legíveis no mobile
- valores e datas resumidos

---

## 28. Feedbacks e microinterações

### Feedbacks esperados
- toast ao salvar peso
- toast ao salvar medição semanal
- aviso após importar backup
- confirmação antes de apagar tudo

### Microinterações
- animação leve na atualização do card de recomendação
- destaque temporário da nova classificação
- transições suaves entre telas

---

## 29. Validações e regras de integridade

### Regras de entrada
- aceitar decimal com vírgula ou ponto
- normalizar internamente
- datas não podem ser futuras
- impedir campos obrigatórios vazios

### Regras de integridade histórica
- peso pode ter no máximo um registro por dia no MVP
- semanal pode ter no máximo um registro por data no MVP
- ao editar registro passado, recalcular estado derivado

### Regras de cálculo
- média de peso baseada nos 7 dias mais recentes disponíveis
- WHtR usa a cintura semanal mais recente válida
- gordura é opcional e nunca bloqueia a recomendação base

---

## 30. Responsividade

### Mobile
- prioridade máxima
- cards empilhados
- gráficos em largura total
- navegação fixa inferior

### Tablet
- grid de 2 colunas para cards
- formulários com melhor distribuição horizontal

### Desktop
- dashboard em grid mais amplo
- histórico com gráficos lado a lado quando houver espaço

---

## 31. Texto funcional sugerido por tela

### Dashboard
Título:
- **Sua fase atual**

Subtexto exemplo:
- “Com base nos seus dados mais recentes, esta é a direção sugerida hoje.”

### Peso
Título:
- **Registrar peso**

Subtexto:
- “Use seu peso da manhã para manter a comparação consistente.”

### Semanal
Título:
- **Atualização semanal**

Subtexto:
- “Registre sua cintura e, se quiser, seu percentual de gordura.”

### Histórico
Título:
- **Sua evolução**

Subtexto:
- “Veja sua tendência ao longo do tempo, não só o número de hoje.”

### Explicação
Título:
- **Como o sistema decidiu**

Subtexto:
- “Estas são as métricas e regras usadas para gerar sua recomendação atual.”

---

## 32. Prioridade de implementação das telas

### Fase 1
- onboarding
- dashboard
- registro de peso
- registro semanal

### Fase 2
- histórico
- explicação da recomendação
- ajustes
- backup/importação

### Fase 3
- refinamentos visuais
- microinterações
- melhorias de usabilidade no desktop

---

## 33. Critérios de aceite por tela

### Onboarding
- usuário consegue iniciar uso em menos de 2 minutos
- dados mínimos são validados corretamente
- perfil é salvo localmente

### Dashboard
- recomendação aparece claramente em menos de 3 segundos
- cards principais são legíveis no mobile
- lembretes aparecem conforme ausência de registro

### Registro de peso
- salvar ou atualizar peso do dia em uma única ação
- média de 7 dias recalcula sem recarregar a página

### Registro semanal
- salvar cintura atualiza WHtR e recomendação
- gordura permanece opcional

### Histórico
- gráficos renderizam sem comprometer a leitura no celular
- usuário consegue editar ou apagar registros

### Ajustes e backup
- exportação gera arquivo válido
- importação restaura corretamente o estado do app
- reset apaga os dados locais com confirmação

---

## 34. Wireframes textuais mobile-first

Esta seção descreve a ordem visual exata dos elementos em cada tela, como um wireframe textual. O objetivo é orientar design, front-end e testes sem depender ainda de layouts gráficos finais.

Convenções usadas:
- `[Header]` = cabeçalho da tela
- `[Card]` = bloco destacado
- `[Input]` = campo de formulário
- `[Button]` = botão de ação
- `[Tabs]` = navegação interna
- `[Nav Bottom]` = barra inferior fixa
- `(opcional)` = elemento condicional

---

## 35. Wireframe — tela de onboarding

### Objetivo da tela
Permitir que o usuário configure o app pela primeira vez com o mínimo de atrito.

### Estrutura visual

```text
[Screen]
  [Safe Area Top]

  [Header]
    Logo/Nome: Hellenistic Dream
    Subtítulo: Acompanhe sua fase de musculação com dados simples.

  [Info Banner]
    Ícone de cadeado
    Texto: Seus dados ficam somente neste navegador.

  [Card: Boas-vindas]
    Título: Vamos começar
    Texto curto: Você vai registrar seu peso diariamente e sua cintura semanalmente.

  [Form Card]
    [Input] Nome (opcional)
    [Input Select/Segmented] Sexo
    [Input Numeric] Altura (cm)
    [Input Numeric] Peso inicial (kg)
    [Input Numeric] Cintura inicial (cm)
    [Input Date] Data da primeira medição
    [Input Numeric] Gordura corporal % (opcional)
    [Input Select] Objetivo inicial (opcional)
      - Ganhar massa
      - Perder gordura
      - Ainda não sei

  [Helper Text]
    Peso: atualizar todos os dias
    Cintura: atualizar 1 vez por semana

  [Button Primary]
    Começar

  [Footer Note]
    Este app apoia sua decisão junto ao seu treinador.
```

### Comportamento
- O botão **Começar** só habilita quando os campos obrigatórios estiverem válidos.
- Erros aparecem logo abaixo do campo.
- No mobile, o formulário deve rolar naturalmente, sem modais.

---

## 36. Wireframe — dashboard principal

### Objetivo da tela
Responder imediatamente: **qual é minha fase atual e por quê?**

### Estrutura visual

```text
[Screen]
  [Safe Area Top]

  [Header]
    Título: Sua fase atual
    Ação secundária: ícone de ajuda ou info

  [Card Hero: Recomendação Atual]
    Badge grande: CUT / BULK / LIVRE ESCOLHA
    Badge menor: Confiança baixa / moderada / alta
    Texto principal: frase curta explicativa
    Texto secundário: baseado nos dados mais recentes
    [Button Secondary] Entender decisão

  [Card Group: Métricas principais]
    [Metric Card]
      Label: Peso médio 7 dias
      Valor: XX,X kg
      Subtexto: média dos últimos 7 dias

    [Metric Card]
      Label: Peso de hoje
      Valor: XX,X kg ou “não registrado”
      Subtexto: registro diário

    [Metric Card]
      Label: Cintura atual
      Valor: XX,X cm
      Subtexto: última medição semanal

    [Metric Card]
      Label: WHtR
      Valor: 0,XX
      Subtexto: cintura / altura

    [Metric Card] (opcional)
      Label: Gordura corporal
      Valor: XX%
      Subtexto: última medição informada

  [Card: Pendências]
    Título: O que falta hoje
    [Reminder Row]
      Texto: Registrar peso de hoje
      [Button Small] Registrar
    [Reminder Row]
      Texto: Atualizar cintura desta semana
      [Button Small] Atualizar

  [Card: Tendência rápida]
    [Trend Row]
      Peso: subindo / caindo / estável
    [Trend Row]
      Cintura: subindo / caindo / estável
    [Trend Row]
      Consistência: boa / média / baixa

  [Card: Evolução resumida]
    Título: Peso
    [Mini Line Chart]

  [Card: Evolução resumida]
    Título: Cintura
    [Mini Line Chart]

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

### Regras de priorização visual
- O **Card Hero** deve ocupar a maior área acima da dobra inicial.
- As métricas devem ficar em cards compactos, 2 por linha no mobile quando houver espaço, ou 1 por linha em telas estreitas.
- Se houver poucos dados, o bloco de pendências sobe na ordem da página.

### Estado com dados insuficientes

```text
[Card Hero: Recomendação preliminar]
  Badge: Leitura inicial
  Texto: Ainda faltam registros para uma leitura mais confiável.
  [Button] Registrar peso
```

---

## 37. Wireframe — tela de registro diário de peso

### Objetivo da tela
Permitir uma entrada extremamente rápida, idealmente em menos de 15 segundos.

### Estrutura visual

```text
[Screen]
  [Header]
    Título: Registrar peso
    Subtítulo: Use o peso da manhã para manter consistência.

  [Card: Resumo rápido]
    Data de hoje
    Último peso registrado
    Média atual de 7 dias

  [Form Card]
    [Input Numeric Large] Peso de hoje (kg)
    [Input TextArea Small] Observação (opcional)

  [Button Primary Full Width]
    Salvar peso

  [Secondary Action]
    Se já existir registro hoje:
    Texto: Você já registrou um peso hoje. Salvar vai atualizar esse valor.

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

### Comportamento
- Ao focar no campo, abrir teclado numérico.
- Ao salvar, mostrar toast curto: **Peso salvo**.
- Se o valor já existir para hoje, substituir o registro do dia.

---

## 38. Wireframe — tela de registro semanal

### Objetivo da tela
Registrar cintura e gordura opcional com clareza suficiente para ser usado junto ao treinador.

### Estrutura visual

```text
[Screen]
  [Header]
    Título: Atualização semanal
    Subtítulo: Registre a cintura e, se quiser, seu percentual de gordura.

  [Info Card]
    Ícone simples
    Texto: Meça sempre do mesmo jeito para comparar corretamente.

  [Card: Última atualização]
    Última cintura: XX cm
    Última gordura: XX% ou “não informado”
    Data: dd/mm/aaaa

  [Form Card]
    [Input Numeric Large] Cintura atual (cm)
    [Input Numeric] Gordura corporal % (opcional)
    [Input TextArea Small] Observação (opcional)

  [Button Primary Full Width]
    Salvar medição semanal

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

### Comportamento
- Após salvar, recalcular recomendação e mostrar feedback.
- Pode exibir um bloco curto após salvar:

```text
[Success Card]
  Título: Recomendação atualizada
  Texto: Sua leitura foi recalculada com a nova medição.
  [Button] Ver dashboard
```

---

## 39. Wireframe — tela de explicação da recomendação

### Objetivo da tela
Dar transparência total sobre a lógica do app.

### Estrutura visual

```text
[Screen]
  [Header]
    Título: Como o sistema decidiu

  [Card Hero]
    Badge grande: CUT / BULK / LIVRE ESCOLHA
    Badge menor: confiança
    Frase-resumo: motivo principal da decisão

  [Card: Dados usados]
    Altura: XXX cm
    Cintura mais recente: XX cm
    WHtR: 0,XX
    Peso médio 7 dias: XX,X kg
    Gordura corporal: XX% (se houver)

  [Card: Explicação simples]
    Linha 1: Sua cintura foi dividida pela sua altura.
    Linha 2: O resultado foi 0,XX.
    Linha 3: Isso coloca você em [faixa].
    Linha 4: Por isso, a recomendação atual é [estado].

  [Accordion: Ver regra completa]
    Regra 1: Se WHtR >= 0,50 → CUT
    Regra 2: Se WHtR < 0,40 → BULK
    Regra 3: Entre 0,40 e 0,49 → usar gordura opcional
    Regra 4: Sem gordura na faixa intermediária → LIVRE ESCOLHA

  [Card: Nota de uso]
    Texto: O app apoia sua conversa com seu treinador. A decisão final deve considerar objetivo, aderência e contexto.

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

### Observação de UX
- Essa tela deve ser textual e muito clara, sem sobrecarga visual.
- O accordion evita assustar o usuário leigo com regra demais logo de cara.

---

## 40. Wireframe — tela de histórico

### Objetivo da tela
Permitir leitura longitudinal para usuário e personal trainer.

### Estrutura visual

```text
[Screen]
  [Header]
    Título: Sua evolução

  [Tabs]
    Peso | Cintura | Classificação | Registros

  [Tab Content: Peso]
    [Filter Chips]
      7 dias | 30 dias | 90 dias | Tudo
    [Card]
      Título: Evolução do peso
      [Line Chart]
        Série 1: peso diário
        Série 2: média móvel de 7 dias
    [Summary Card]
      Texto: tendência da última janela

  [Tab Content: Cintura]
    [Filter Chips]
      30 dias | 90 dias | Tudo
    [Card]
      Título: Evolução da cintura
      [Line Chart]
    [Summary Card]
      Texto: tendência semanal

  [Tab Content: Classificação]
    [Card]
      Título: Mudanças de fase
      [Timeline]
        Blocos: BULK / CUT / LIVRE ESCOLHA
    [Summary Card]
      Texto: último estado e data da última troca

  [Tab Content: Registros]
    [List]
      [List Item]
        Data
        Tipo: peso / semanal
        Valor principal
        Valor secundário
        [Icon Button] Editar
        [Icon Button] Apagar

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

### Regras de leitura
- O gráfico deve priorizar legibilidade sobre densidade de informação.
- Os filtros aparecem como chips tocáveis.
- A aba “Registros” é a mais operacional; as outras são analíticas.

---

## 41. Wireframe — tela de ajustes

### Objetivo da tela
Centralizar perfil, privacidade e ações sobre dados.

### Estrutura visual

```text
[Screen]
  [Header]
    Título: Ajustes

  [Card Section]
    Título: Perfil
    [Input] Nome
    [Input Select/Segmented] Sexo
    [Input Numeric] Altura (cm)
    [Input Select] Objetivo inicial
    [Button Secondary] Salvar perfil

  [Card Section]
    Título: Privacidade
    Texto: Seus dados são armazenados somente neste navegador.

  [Card Section]
    Título: Dados
    [Button Secondary] Exportar dados
    [Button Secondary] Importar backup
    [Button Danger] Apagar todos os dados

  [Card Section] (opcional futuro)
    Título: Aparência
    [Toggle/Select] Claro / Escuro / Automático

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

### Comportamento
- Alterar altura dispara recálculo do WHtR.
- Apagar dados abre modal de confirmação forte.

---

## 42. Wireframe — tela de exportação/importação

### Objetivo da tela
Oferecer segurança operacional em um app sem nuvem.

### Estrutura visual

```text
[Screen]
  [Header]
    Título: Backup

  [Card]
    Título: Exportar
    Texto: Salve uma cópia local dos seus dados.
    [Button Secondary] Exportar JSON
    [Button Secondary] Exportar CSV

  [Card]
    Título: Importar
    Texto: Restaure seus dados a partir de um arquivo de backup.
    [File Input]
    [Info Text] No MVP, a importação substitui os dados atuais.
    [Button Primary] Importar arquivo

  [Card Warning]
    Texto: Antes de importar, faça backup dos dados atuais se quiser preservá-los.

  [Nav Bottom]
    Início | Peso | Semanal | Histórico | Ajustes
```

---

## 43. Wireframe — modal de confirmação de reset

### Estrutura visual

```text
[Modal]
  Título: Apagar todos os dados?
  Texto: Isso removerá todas as informações salvas neste navegador e a ação não poderá ser desfeita.

  [Button Secondary] Cancelar
  [Button Danger] Apagar tudo
```

### Regras
- Botão destrutivo visualmente destacado.
- Modal bloqueia a ação até confirmação explícita.

---

## 44. Wireframe — estados vazios principais

### Dashboard vazio parcial

```text
[Empty State Card]
  Título: Falta pouco para sua leitura ficar melhor
  Texto: Continue registrando seu peso diário e sua cintura semanal.
  [Button] Registrar peso
```

### Histórico vazio

```text
[Empty State Card]
  Título: Seu histórico vai aparecer aqui
  Texto: Conforme você registra suas medições, os gráficos e a linha do tempo serão preenchidos.
  [Button] Fazer primeiro registro
```

### Sem medição semanal recente

```text
[Warning Card]
  Título: Atualize sua medição semanal
  Texto: Sua recomendação pode ficar mais confiável com uma cintura mais recente.
  [Button] Atualizar agora
```

---

## 45. Wireframe — ordem de prioridade para implementação visual

### Blocos críticos do MVP
1. Header padrão
2. Nav Bottom
3. RecommendationCard
4. MetricCard
5. Form Card de peso
6. Form Card semanal
7. Charts simples
8. Empty states
9. Modal de reset

### Justificativa
Esses blocos cobrem o fluxo mais importante:
- abrir app
- entender fase atual
- registrar dados
- ver evolução
- proteger os dados

---

## 46. Diretrizes de wireframe para desktop

O desktop deve reutilizar a mesma hierarquia visual do mobile, apenas com melhor aproveitamento horizontal.

### Dashboard desktop
Sugestão de grid:

```text
[Header]

[Hero Recommendation Card..............................]

[Metric 1] [Metric 2] [Metric 3] [Metric 4] [Metric 5]

[Pendências..................] [Tendência rápida........]

[Gráfico Peso.........................................]
[Gráfico Cintura......................................]
```

### Histórico desktop
Sugestão:
- tabs no topo
- gráficos em cards mais largos
- lista de registros com mais colunas visíveis

---

## 47. Entregável de design derivado deste wireframe

Este wireframe textual já permite gerar os seguintes próximos entregáveis:
- wireframes visuais de baixa fidelidade
- biblioteca de componentes de UI
- protótipo navegável
- implementação front-end em React

---

## 48. Resumo prático do fluxo do usuário

```text
1. Usuário abre o app
2. Faz onboarding
3. Vai para o dashboard
4. Registra peso todos os dias
5. Registra cintura 1 vez por semana
6. Dashboard recalcula a fase
7. Usuário e treinador consultam histórico e explicação
8. Usuário exporta backup quando quiser
```

---

## 49. Próximo passo recomendado

Depois deste wireframe, o próximo material mais útil é um destes:
- **arquitetura de componentes React**
- **design system visual leve**
- **especificação de dados e regras em JSON/TypeScript**
- **protótipo em canvas com telas já renderizadas**

