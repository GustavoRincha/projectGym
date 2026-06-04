# 🏋️ Gym Track

O **Gym Track** é um aplicativo web progressivo (PWA) projetado para rastreamento pessoal de treinos, progresso físico e metas de dieta. Com uma interface moderna, responsiva e glassmórfica, o aplicativo permite que os usuários planejem e executem seus treinos diários, controlem suas cargas e macros alimentares, e ganhem recompensas por meio de um sistema integrado de gamificação.

---

## 🌟 Principais Funcionalidades

### 1. 📅 Painel Principal (Meu Plano)
* **Sugestão Inteligente**: Sugere automaticamente o próximo treino com base no cronograma ou no histórico recente.
* **Linha do Tempo Semanal**: Acompanhamento visual minimalista dos dias treinados na semana (Seg-Dom).
* **Contador de Streak (Chamas)**: Acompanha a sequência de dias consecutivos de treino, respeitando os dias de descanso configurados.
* **Estatísticas rápidas**: Visualização de treinos concluídos na semana e no mês.

### 2. 📝 Planejador e Gerenciador de Treinos
* **Divisão de Treinos (Splits)**: Suporte a divisões clássicas de fichas de treino (ABC, AB, Full Body, etc.).
* **Agrupamento de Bi-Sets**: Permite conectar dois ou mais exercícios para execução em super-série (Bi-Set).
* **Progressão de Carga Automatizada**: Configuração de metas de progressão:
  * Progressão fixa (kg) ou percentual (%).
  * Dupla progressão (Reps → Carga).
  * Aumento incremental por série.

### 3. ⏱️ Execução de Treino Ativo
* **Cronômetro em Background**: Acompanhamento do tempo total sob tensão. O estado é persistido localmente para que a sessão não seja perdida se o navegador atualizar ou for minimizado.
* **Scroll Picker (Roda de Seleção)**: Roda tátil interativa para inserção rápida de carga e repetições por série.
* **Registro de Cardio**: Cronômetro e controles dedicados para corrida, elíptico, escada ou bicicleta ergométrica.
* **Anotações da Sessão**: Campo para notas sobre disposição, cansaço ou observações gerais.

### 4. 📈 Evolução Corporal e Dieta
* **Histórico de Peso e BF**: Acompanhamento gráfico de peso corporal e percentual de gordura.
* **Diário de Medidas**: Registro completo de perímetros (braço, tórax, cintura, coxas, etc.).
* **Calculador de Macros e Dieta**: Metas personalizadas de calorias, proteínas, carboidratos e gorduras com diário alimentar para registro diário de refeições.

### 5. 📖 Enciclopédia de Exercícios
* **Base de Dados Offline**: Carregamento assíncrono de centenas de exercícios físicos.
* **Guias de Execução**: Instruções detalhadas de movimento em português com indicação do músculo principal e equipamento.
* **Visualização Multimídia**: Exibição de GIFs demonstrando a execução correta de cada exercício.
* **Busca Aproximada (Fuzzy Search)**: Busca tolerante a erros de digitação.

### 6. 🏆 Perfil e Gamificação
* **Níveis e XP**: Ganho de +50 XP a cada treino finalizado para evoluir de nível (Iniciante a Lendário).
* **Conquistas e Medalhas (Badges)**: Sistema automático de desbloqueio de medalhas baseadas em marcos de performance (ex: levantar mais de 10 toneladas acumuladas, treinar de madrugada, bater metas de streak).
* **Customização do Tema**: Troca rápida entre modo escuro/claro e personalização da cor de destaque do aplicativo.

### 7. 📶 Suporte Offline e Sincronização (PWA)
* **Fila de Sincronização Inteligente**: As ações realizadas sem conexão (offline) são salvas em fila local e enviadas automaticamente para o banco de dados Supabase assim que a internet for restabelecida.
* **Instalável (PWA)**: Funciona offline com cache completo de fontes e estilos locais via Service Worker.

---

## 🛠️ Stack Tecnológica

* **Core**: [Vue 3](https://vuejs.org/) (Composition API)
* **Ferramenta de Build**: [Vite](https://vitejs.dev/)
* **Interface e Estilização**: [Vuetify 3](https://vuetifyjs.com/) (Material Design)
* **Gerenciamento de Estado**: [Vuex 4](https://vuex.vuejs.org/)
* **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
* **Testes Automatizados**: [Vitest](https://vitest.dev/)
* **Análise Estática**: ESLint

---

## 🚀 Como Iniciar

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado.

1. **Instalar dependências**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configurar variáveis de ambiente**:
   Crie ou edite um arquivo `.env` na raiz do projeto informando as credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
   ```

3. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Compilar para produção**:
   ```bash
   npm run build
   ```

---

## 🧪 Qualidade e Testes

O projeto utiliza ESLint para análise de código e Vitest para a execução de testes automatizados nas regras de negócios de treinos e buscas.

* **Executar Linter**:
  ```bash
  npm run lint
  ```

* **Rodar Testes Unitários**:
  ```bash
  npm test
  ```
