<template>
  <div class="diet-panel pb-16">
    <!-- Seletor de Data -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-3 border-thin">
      <div class="d-flex justify-space-between align-center">
        <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="changeDate(-1)"></v-btn>
        <span class="text-subtitle-1 font-weight-black text-primary d-flex align-center">
          <v-icon icon="mdi-calendar" class="mr-2" size="small"></v-icon>
          {{ displayDate }}
        </span>
        <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="changeDate(1)" :disabled="isToday"></v-btn>
      </div>
    </v-card>

    <!-- Resumo de Calorias e Macros -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-5 border-thin">
      <v-row align="center">
        <v-col cols="12" md="6" class="d-flex justify-center py-4">
          <!-- Círculo de Progresso de Calorias -->
          <div class="calorie-progress-wrapper">
            <svg viewBox="0 0 120 120" class="calorie-progress-svg">
              <circle cx="60" cy="60" r="54" class="track" />
              <circle cx="60" cy="60" r="54" class="progress" :style="circleProgressStyle" />
            </svg>
            <div class="calorie-text">
              <span class="text-caption text-medium-emphasis">Restam</span>
              <span class="text-h5 font-weight-black" :class="caloriesRemaining < 0 ? 'text-error' : 'text-primary'">
                {{ Math.abs(caloriesRemaining) }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ caloriesRemaining < 0 ? 'kcal extras' : 'kcal' }}
              </span>
            </div>
          </div>
        </v-col>
        
        <v-col cols="12" md="6">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span class="text-medium-emphasis">Consumido: <strong>{{ totals.calories }} kcal</strong></span>
            <span class="text-medium-emphasis">Meta: <strong>{{ targets.calories }} kcal</strong></span>
          </div>
          
          <v-divider class="my-4"></v-divider>
          
          <!-- Proteínas -->
          <div class="mb-3">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span class="font-weight-bold text-info">🧬 Proteínas</span>
              <span>{{ totals.protein }}g / {{ targets.protein }}g</span>
            </div>
            <v-progress-linear
              :model-value="macroPercentage(totals.protein, targets.protein)"
              color="info"
              height="8"
              rounded
            ></v-progress-linear>
          </div>

          <!-- Carboidratos -->
          <div class="mb-3">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span class="font-weight-bold text-success">🍞 Carboidratos</span>
              <span>{{ totals.carbs }}g / {{ targets.carbs }}g</span>
            </div>
            <v-progress-linear
              :model-value="macroPercentage(totals.carbs, targets.carbs)"
              color="success"
              height="8"
              rounded
            ></v-progress-linear>
          </div>

          <!-- Gorduras -->
          <div>
            <div class="d-flex justify-space-between text-caption mb-1">
              <span class="font-weight-bold text-warning">🥑 Gorduras</span>
              <span>{{ totals.fat }}g / {{ targets.fat }}g</span>
            </div>
            <v-progress-linear
              :model-value="macroPercentage(totals.fat, targets.fat)"
              color="warning"
              height="8"
              rounded
            ></v-progress-linear>
          </div>
        </v-col>
      </v-row>
      
      <v-row class="mt-4 pt-2 border-top-thin">
        <v-col cols="6">
          <v-btn block color="secondary" variant="tonal" rounded="pill" size="small" @click="calculatorDialog = true">
            <v-icon icon="mdi-calculator" start></v-icon>
            Calcular Meta
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn block color="primary" variant="tonal" rounded="pill" size="small" @click="targetsDialog = true">
            <v-icon icon="mdi-cog" start></v-icon>
            Ajustar Metas
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Lista de Refeições -->
    <v-card
      v-for="(mealKey, idx) in Object.keys(mealOptions)"
      :key="idx"
      color="surface"
      elevation="2"
      rounded="xl"
      class="mb-4 pa-4 border-thin"
    >
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="d-flex align-center">
          <span class="text-subtitle-2 font-weight-black d-flex align-center">
            <span class="mr-2">{{ mealOptions[mealKey].icon }}</span>
            {{ mealOptions[mealKey].label }}
          </span>
          <v-chip size="x-small" variant="flat" color="background" class="ml-2 font-weight-bold">
            {{ getMealCalories(mealKey) }} kcal
          </v-chip>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          size="x-small"
          rounded="pill"
          prepend-icon="mdi-plus"
          @click="openAddFoodModal(mealKey)"
        >
          Adicionar
        </v-btn>
      </div>

      <!-- Alimentos Registrados na Refeição -->
      <div v-if="!getMealFoods(mealKey).length" class="text-center py-4 text-medium-emphasis text-caption">
        Nenhum alimento registrado para esta refeição.
      </div>
      <div v-else>
        <div
          v-for="food in getMealFoods(mealKey)"
          :key="food.id"
          class="d-flex justify-space-between align-center py-2 border-bottom-thin position-relative"
        >
          <div style="max-width: 75%;">
            <span class="text-body-2 font-weight-medium d-block leading-snug">{{ food.name }}</span>
            <span class="text-xxs text-medium-emphasis">
              Qtd: {{ food.portionText || (food.quantity ? food.quantity + 'x' : '1x') }} | P: {{ food.protein }}g | C: {{ food.carbs }}g | G: {{ food.fat }}g
            </span>
          </div>
          <div class="d-flex align-center">
            <span class="text-body-2 font-weight-bold mr-2">{{ Math.round(food.calories * (food.quantity || 1)) }} kcal</span>
            <v-btn
              icon="mdi-pencil-outline"
              size="x-small"
              variant="text"
              color="primary"
              class="mr-1"
              @click="openEditFoodModal(mealKey, food)"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="deleteFoodItem(mealKey, food.id)"
            ></v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Dialog: Adicionar Alimento -->
    <v-dialog v-model="foodDialog" max-width="480">
      <v-card color="surface" rounded="xl" class="pa-4 glass-card">
        <v-card-title class="text-h6 font-weight-bold pt-2 px-2 d-flex align-center">
          <v-icon icon="mdi-food-apple" class="mr-2 text-primary" size="small"></v-icon>
          {{ isEditing ? 'Editar Alimento' : 'Adicionar Alimento' }}
        </v-card-title>
        
        <v-card-text class="px-2 pt-2 pb-0">
          <!-- Campo de Busca na API -->
          <div class="mb-4">
            <div class="text-subtitle-2 font-weight-bold mb-2 text-medium-emphasis">Buscar no Banco de Alimentos (Open Food Facts)</div>
            <v-text-field
              v-model="searchQuery"
              label="Buscar alimento (ex: Whey, Iogurte, Frango)"
              variant="outlined"
              density="comfortable"
              hide-details
              append-inner-icon="mdi-magnify"
              :loading="searchLoading"
              @click:append-inner="searchFoodApi"
              @keyup.enter="searchFoodApi"
              class="mb-2"
            ></v-text-field>

            <!-- Palavras-chave Rápidas -->
            <div class="d-flex flex-wrap gap-1 mb-2">
              <v-chip
                v-for="kw in quickKeywords"
                :key="kw"
                size="x-small"
                class="cursor-pointer mr-1 mb-1"
                variant="tonal"
                color="primary"
                @click="triggerQuickSearch(kw)"
              >
                {{ kw }}
              </v-chip>
            </div>

            <!-- Resultados da Busca -->
            <div v-if="searchResults.length > 0" class="search-results-list border-thin rounded-lg pa-1 mb-2">
              <div
                v-for="(res, idx) in searchResults"
                :key="idx"
                class="search-result-item pa-2 rounded cursor-pointer hover-bg d-flex justify-space-between align-center"
                @click="applyApiFood(res)"
              >
                <div style="max-width: 80%;">
                  <span class="text-caption font-weight-bold d-block text-truncate">{{ res.name }}</span>
                  <span class="text-xxs text-medium-emphasis">
                    P: {{ res.protein }}g | C: {{ res.carbs }}g | G: {{ res.fat }}g
                  </span>
                </div>
                <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black">
                  {{ res.calories }} kcal
                </v-chip>
              </div>
            </div>
            <div v-else-if="searchQuery && !searchLoading && searchResults.length === 0" class="text-center py-2 text-caption text-medium-emphasis">
              Pressione Enter ou clique na lupa para buscar.
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Dados do Alimento Selecionado / Manual -->
          <div class="text-subtitle-2 font-weight-bold mb-2 text-medium-emphasis">Dados do Alimento</div>
          
          <v-text-field
            v-model="foodForm.name"
            label="Nome do Alimento"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            hide-details
          ></v-text-field>

          <!-- Seletor de Medida e Quantidade Proporcional -->
          <v-row class="mb-2">
            <v-col cols="7" class="py-1 pr-1">
              <v-text-field
                v-model.number="amountInput"
                :label="measureMode === 'g' ? 'Peso (g)' : (measureMode === 'ml' ? 'Volume (ml)' : 'Quantidade')"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
                min="0"
              ></v-text-field>
            </v-col>
            <v-col cols="5" class="py-1 pl-1">
              <v-select
                v-model="measureMode"
                :items="[
                  { title: 'Grama (g)', value: 'g' },
                  { title: 'Mililitro (ml)', value: 'ml' },
                  { title: 'Unidade (uni)', value: 'uni' }
                ]"
                item-title="title"
                item-value="value"
                label="Unidade"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-select>
            </v-col>
          </v-row>

          <div v-if="selectedFoodBase" class="text-caption text-primary mb-3 px-1">
            💡 Base de referência: {{ selectedFoodBase.baseAmount }}{{ selectedFoodBase.baseUnit }} = {{ selectedFoodBase.calories }} kcal
          </div>

          <div class="text-subtitle-2 font-weight-bold mb-2 px-1 text-medium-emphasis">Informações Nutricionais Totais</div>

          <v-row class="mb-3">
            <v-col cols="12" class="py-1">
              <v-text-field
                v-model.number="foodForm.calories"
                label="Calorias (kcal)"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mb-2 px-1 text-medium-emphasis">Macronutrientes</div>
          <v-row class="mb-4">
            <v-col cols="4" class="py-2 pr-1">
              <v-text-field
                v-model.number="foodForm.protein"
                label="Proteínas (g)"
                type="number"
                variant="outlined"
                density="comfortable"
                color="info"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="4" class="py-2 px-1">
              <v-text-field
                v-model.number="foodForm.carbs"
                label="Carbo (g)"
                type="number"
                variant="outlined"
                density="comfortable"
                color="success"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="4" class="py-2 pl-1">
              <v-text-field
                v-model.number="foodForm.fat"
                label="Gorduras (g)"
                type="number"
                variant="outlined"
                density="comfortable"
                color="warning"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-2 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="foodDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveFoodItem"
            :disabled="!foodForm.name || !foodForm.calories"
          >
            {{ isEditing ? 'Salvar' : 'Adicionar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Ajustar Metas Manuais -->
    <v-dialog v-model="targetsDialog" max-width="380">
      <v-card color="surface" rounded="xl" class="pa-4 glass-card">
        <v-card-title class="text-h6 font-weight-bold pt-2 px-2 d-flex align-center">
          <v-icon icon="mdi-cog" class="mr-2 text-primary" size="small"></v-icon>
          Ajustar Metas Diárias
        </v-card-title>
        <v-card-text class="px-2 pt-2 pb-0">
          <v-text-field
            v-model.number="targetsForm.calories"
            label="Meta de Calorias (kcal)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model.number="targetsForm.protein"
            label="Meta de Proteínas (g)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            color="info"
          ></v-text-field>

          <v-text-field
            v-model.number="targetsForm.carbs"
            label="Meta de Carboidratos (g)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            color="success"
          ></v-text-field>

          <v-text-field
            v-model.number="targetsForm.fat"
            label="Meta de Gorduras (g)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            color="warning"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-2 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="targetsDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveManualTargets">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Calculadora TDEE -->
    <v-dialog v-model="calculatorDialog" max-width="450">
      <v-card color="surface" rounded="xl" class="pa-4 glass-card">
        <v-card-title class="text-h6 font-weight-bold pt-2 px-2 d-flex align-center">
          <v-icon icon="mdi-calculator" class="mr-2 text-primary" size="small"></v-icon>
          Calculadora de Calorias (TDEE)
        </v-card-title>
        <v-card-text class="px-2 pt-2 pb-0">
          <p class="text-caption text-medium-emphasis mb-4">
            Com base na fórmula de Harris-Benedict revisada, calcularemos suas necessidades calóricas.
          </p>

          <v-row class="mb-3">
            <v-col cols="6" class="py-0 pr-1">
              <v-text-field
                v-model.number="calcForm.weight"
                label="Peso (kg)"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0 pl-1">
              <v-text-field
                v-model.number="calcForm.height"
                label="Altura (cm)"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row class="mb-3">
            <v-col cols="6" class="py-0 pr-1">
              <v-text-field
                v-model.number="calcForm.age"
                label="Idade (anos)"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0 pl-1">
              <v-select
                v-model="calcForm.gender"
                :items="[
                  { title: 'Masculino', value: 'male' },
                  { title: 'Feminino', value: 'female' }
                ]"
                item-title="title"
                item-value="value"
                label="Gênero"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-select>
            </v-col>
          </v-row>

          <v-select
            v-model="calcForm.activity"
            :items="[
              { title: 'Sedentário (pouco/nenhum exercício)', value: 1.2 },
              { title: 'Leve (exercício 1-3 dias/semana)', value: 1.375 },
              { title: 'Moderado (exercício 3-5 dias/semana)', value: 1.55 },
              { title: 'Intenso (exercício 6-7 dias/semana)', value: 1.725 }
            ]"
            item-title="title"
            item-value="value"
            label="Nível de Atividade"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            hide-details
          ></v-select>

          <v-select
            v-model="calcForm.goal"
            :items="[
              { title: 'Perder Peso (Déficit)', value: 'lose' },
              { title: 'Manter Peso (Manutenção)', value: 'maintain' },
              { title: 'Ganhar Peso / Massa (Superávit)', value: 'gain' }
            ]"
            item-title="title"
            item-value="value"
            label="Objetivo"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            hide-details
          ></v-select>
        </v-card-text>
        <v-card-actions class="px-2 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="calculatorDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="calculateAndApply">Calcular e Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// Gerenciamento de Data
const currentDate = ref(new Date());

const formattedDateKey = computed(() => {
  const d = currentDate.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

const displayDate = computed(() => {
  const d = currentDate.value;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(d, today)) return 'Hoje';
  if (isSameDay(d, yesterday)) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
});

const isToday = computed(() => {
  const today = new Date();
  const d = currentDate.value;
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
});

const changeDate = (days) => {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() + days);
  currentDate.value = d;
};

// Configurações e Metas
const targets = computed(() => {
  const bodyGoals = store.getters['body/goals'];
  return bodyGoals?.diet?.targets || { calories: 2000, protein: 150, carbs: 200, fat: 67 };
});

const logs = computed(() => {
  const bodyGoals = store.getters['body/goals'];
  return bodyGoals?.diet?.logs || {};
});

// Totais Consumidos no Dia Selecionado
const totals = computed(() => {
  const dayLog = logs.value[formattedDateKey.value];
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  if (dayLog && dayLog.meals) {
    Object.keys(dayLog.meals).forEach(mealKey => {
      const foods = dayLog.meals[mealKey] || [];
      foods.forEach(f => {
        const qty = f.quantity || 1;
        t.calories += Math.round((f.calories || 0) * qty);
        t.protein += Math.round((f.protein || 0) * qty);
        t.carbs += Math.round((f.carbs || 0) * qty);
        t.fat += Math.round((f.fat || 0) * qty);
      });
    });
  }
  return t;
});

const caloriesRemaining = computed(() => {
  return targets.value.calories - totals.value.calories;
});

// Estilo de Progresso Circular de Calorias (Circunferência = 2 * PI * r = 2 * 3.14159 * 54 = 339.3)
const circleProgressStyle = computed(() => {
  const circumference = 339.3;
  const pct = Math.min(totals.value.calories / targets.value.calories, 1);
  const strokeDashoffset = circumference - (pct * circumference);
  return {
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: strokeDashoffset
  };
});

const macroPercentage = (current, target) => {
  if (!target) return 0;
  return Math.min((current / target) * 100, 100);
};

// Mapeamento de Refeições
const mealOptions = {
  breakfast: { label: 'Café da Manhã', icon: '🍳' },
  lunch: { label: 'Almoço', icon: '🍗' },
  dinner: { label: 'Jantar', icon: '🥗' },
  snack: { label: 'Lanches / Outros', icon: '🍎' }
};

const getMealFoods = (mealKey) => {
  const dayLog = logs.value[formattedDateKey.value];
  return dayLog?.meals?.[mealKey] || [];
};

const getMealCalories = (mealKey) => {
  const foods = getMealFoods(mealKey);
  return foods.reduce((acc, f) => acc + Math.round((f.calories || 0) * (f.quantity || 1)), 0);
};

// Modal de Alimento
const foodDialog = ref(false);
const activeMeal = ref('');
const foodForm = reactive({ name: '', calories: '', quantity: 1, protein: '', carbs: '', fat: '' });

// Estados reativos para cálculo de porcionamento
const selectedFoodBase = ref(null);
const measureMode = ref('g');
const amountInput = ref(100);

// API Search & Local Database States
const searchQuery = ref('');
const searchLoading = ref(false);
const searchResults = ref([]);
const quickKeywords = ['Ovo', 'Frango', 'Arroz', 'Banana', 'Whey', 'Iogurte', 'Pão', 'Leite'];

// Banco de dados local de alimentos básicos brasileiros (garante pesquisas limpas e específicas)
const BASIC_FOODS = [
  // Frutas e Vegetais
  { name: 'Banana Nanica', calories: 92, protein: 1.4, carbs: 23.8, fat: 0.1, baseAmount: 100, baseUnit: 'g', tags: ['banana', 'nanica', 'fruta'] },
  { name: 'Banana Prata', calories: 98, protein: 1.3, carbs: 26, fat: 0.1, baseAmount: 100, baseUnit: 'g', tags: ['banana', 'prata', 'fruta'] },
  { name: 'Banana Maçã', calories: 87, protein: 1.8, carbs: 22.3, fat: 0.1, baseAmount: 100, baseUnit: 'g', tags: ['banana', 'maca', 'fruta'] },
  { name: 'Maçã Fuji', calories: 56, protein: 0.3, carbs: 15.2, fat: 0, baseAmount: 100, baseUnit: 'g', tags: ['maca', 'fuji', 'fruta'] },
  { name: 'Maçã Gala', calories: 60, protein: 0.2, carbs: 15, fat: 0, baseAmount: 100, baseUnit: 'g', tags: ['maca', 'gala', 'fruta'] },
  { name: 'Laranja Pêra', calories: 47, protein: 0.9, carbs: 11.5, fat: 0.1, baseAmount: 100, baseUnit: 'g', tags: ['laranja', 'pera', 'fruta'] },
  { name: 'Morango', calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3, baseAmount: 100, baseUnit: 'g', tags: ['morango', 'fruta'] },
  { name: 'Abacate', calories: 96, protein: 1.2, carbs: 6, fat: 8.4, baseAmount: 100, baseUnit: 'g', tags: ['abacate', 'fruta'] },
  { name: 'Mamão Papaia', calories: 46, protein: 0.5, carbs: 11.6, fat: 0.1, baseAmount: 100, baseUnit: 'g', tags: ['mamao', 'papaia', 'fruta'] },
  
  // Fontes de Carboidratos
  { name: 'Arroz Branco Cozido', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, baseAmount: 100, baseUnit: 'g', tags: ['arroz', 'branco', 'cozido'] },
  { name: 'Arroz Integral Cozido', calories: 124, protein: 2.6, carbs: 25.8, fat: 1, baseAmount: 100, baseUnit: 'g', tags: ['arroz', 'integral', 'cozido'] },
  { name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, baseAmount: 100, baseUnit: 'g', tags: ['feijao', 'carioca', 'cozido'] },
  { name: 'Feijão Preto Cozido', calories: 77, protein: 4.5, carbs: 14, fat: 0.5, baseAmount: 100, baseUnit: 'g', tags: ['feijao', 'preto', 'cozido'] },
  { name: 'Batata Doce Cozida', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, baseAmount: 100, baseUnit: 'g', tags: ['batata', 'doce', 'cozida'] },
  { name: 'Batata Inglesa Cozida', calories: 52, protein: 1.2, carbs: 11.9, fat: 0, baseAmount: 100, baseUnit: 'g', tags: ['batata', 'inglesa', 'cozida'] },
  { name: 'Mandioca Cozida', calories: 125, protein: 0.6, carbs: 30, fat: 0.3, baseAmount: 100, baseUnit: 'g', tags: ['mandioca', 'aipim', 'macaxeira', 'cozida'] },
  { name: 'Pão Francês', calories: 137, protein: 4.7, carbs: 28.5, fat: 1.5, baseAmount: 1, baseUnit: 'uni', weightPerUnit: 50, tags: ['pao', 'frances', 'paozinho'] },
  { name: 'Pão Integral', calories: 61, protein: 2.4, carbs: 11.2, fat: 0.7, baseAmount: 1, baseUnit: 'uni', weightPerUnit: 25, tags: ['pao', 'integral', 'fatia'] },
  { name: 'Aveia em Flocos', calories: 104, protein: 4.3, carbs: 17, fat: 2.2, baseAmount: 30, baseUnit: 'g', tags: ['aveia', 'flocos'] },
  
  // Fontes de Proteínas e Derivados
  { name: 'Peito de Frango Grelhado', calories: 159, protein: 32, carbs: 0, fat: 2.5, baseAmount: 100, baseUnit: 'g', tags: ['peito', 'frango', 'grelhado', 'peito de frango'] },
  { name: 'Peito de Frango Cozido', calories: 163, protein: 31.5, carbs: 0, fat: 3.2, baseAmount: 100, baseUnit: 'g', tags: ['peito', 'frango', 'cozido'] },
  { name: 'Ovo Inteiro Cozido', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, baseAmount: 1, baseUnit: 'uni', weightPerUnit: 50, tags: ['ovo', 'cozido', 'inteiro'] },
  { name: 'Ovo Inteiro Frito', calories: 95, protein: 6.5, carbs: 0.6, fat: 7.5, baseAmount: 1, baseUnit: 'uni', weightPerUnit: 50, tags: ['ovo', 'frito'] },
  { name: 'Clara de Ovo Cozida', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, baseAmount: 100, baseUnit: 'g', tags: ['clara', 'ovo', 'cozida'] },
  { name: 'Carne Moída Patinho Grelhado', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, baseAmount: 100, baseUnit: 'g', tags: ['carne', 'moida', 'patinho', 'boi'] },
  { name: 'Carne Moída Acém', calories: 212, protein: 26.7, carbs: 0, fat: 10.9, baseAmount: 100, baseUnit: 'g', tags: ['carne', 'moida', 'acem'] },
  { name: 'Filé de Tilápia Grelhado', calories: 111, protein: 23, carbs: 0, fat: 1.2, baseAmount: 100, baseUnit: 'g', tags: ['peixe', 'tilapia', 'file', 'grelhado'] },
  { name: 'Atum Ralado em Lata ao Natural', calories: 116, protein: 26, carbs: 0, fat: 1.2, baseAmount: 100, baseUnit: 'g', tags: ['peixe', 'atum', 'lata', 'natural'] },
  
  // Laticínios e Suplementos
  { name: 'Leite Desnatado', calories: 66, protein: 6.4, carbs: 9.4, fat: 0.4, baseAmount: 200, baseUnit: 'ml', tags: ['leite', 'desnatado'] },
  { name: 'Leite Integral', calories: 117, protein: 5.8, carbs: 9.2, fat: 6.4, baseAmount: 200, baseUnit: 'ml', tags: ['leite', 'integral'] },
  { name: 'Iogurte Natural Desnatado', calories: 70, protein: 6.8, carbs: 10, fat: 0.5, baseAmount: 170, baseUnit: 'g', tags: ['iogurte', 'natural', 'desnatado'] },
  { name: 'Iogurte Natural Integral', calories: 120, protein: 6, carbs: 9, fat: 7, baseAmount: 170, baseUnit: 'g', tags: ['iogurte', 'natural', 'integral'] },
  { name: 'Queijo Cottage', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, baseAmount: 100, baseUnit: 'g', tags: ['queijo', 'cottage'] },
  { name: 'Queijo Minas Frescal', calories: 264, protein: 17.4, carbs: 3.2, fat: 20.2, baseAmount: 100, baseUnit: 'g', tags: ['queijo', 'minas', 'frescal'] },
  { name: 'Whey Protein Concentrado', calories: 120, protein: 24, carbs: 3, fat: 2, baseAmount: 30, baseUnit: 'g', tags: ['whey', 'protein', 'concentrado', 'suplemento'] },
  { name: 'Creatina Monohidratada', calories: 0, protein: 0, carbs: 0, fat: 0, baseAmount: 3, baseUnit: 'g', tags: ['creatina', 'suplemento'] }
];

// Estados para edição de alimento
const isEditing = ref(false);
const editingFoodId = ref(null);

const openAddFoodModal = (mealKey) => {
  activeMeal.value = mealKey;
  isEditing.value = false;
  editingFoodId.value = null;
  selectedFoodBase.value = null;
  foodForm.name = '';
  foodForm.calories = '';
  foodForm.protein = '';
  foodForm.carbs = '';
  foodForm.fat = '';
  
  // Valores padrão para entrada manual
  measureMode.value = 'g';
  amountInput.value = 100;
  
  // Limpar campos de busca
  searchQuery.value = '';
  searchResults.value = [];
  foodDialog.value = true;
};

const openEditFoodModal = (mealKey, food) => {
  activeMeal.value = mealKey;
  isEditing.value = true;
  editingFoodId.value = food.id;
  
  foodForm.name = food.name;
  foodForm.calories = food.calories;
  foodForm.protein = food.protein;
  foodForm.carbs = food.carbs;
  foodForm.fat = food.fat;
  
  // Tentar inferir quantidade e unidade do portionText
  if (food.portionText) {
    const match = food.portionText.match(/^([\d.]+)\s*(g|ml|uni)$/);
    if (match) {
      amountInput.value = parseFloat(match[1]);
      measureMode.value = match[2];
    } else {
      amountInput.value = 100;
      measureMode.value = 'g';
    }
  } else {
    amountInput.value = food.quantity || 1;
    measureMode.value = 'uni';
  }
  
  // Criar uma base de referência do próprio alimento editado
  selectedFoodBase.value = {
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    baseAmount: amountInput.value,
    baseUnit: measureMode.value
  };
  
  searchQuery.value = '';
  searchResults.value = [];
  foodDialog.value = true;
};

const searchLocalFoods = (query) => {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return BASIC_FOODS.filter(food => {
    const normalizedName = food.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nameMatch = normalizedName.includes(normalizedQuery);
    
    const tagMatch = food.tags.some(tag => {
      const normalizedTag = tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedTag.includes(normalizedQuery);
    });
    
    return nameMatch || tagMatch;
  });
};

const mergeResults = (localRes, apiRes) => {
  const merged = [...localRes];
  const seenNames = new Set(localRes.map(item => item.name.toLowerCase()));
  
  apiRes.forEach(item => {
    if (!seenNames.has(item.name.toLowerCase())) {
      merged.push(item);
      seenNames.add(item.name.toLowerCase());
    }
  });
  
  return merged;
};

const searchFoodApi = async () => {
  const query = searchQuery.value.trim();
  if (!query) {
    searchResults.value = [];
    return;
  }

  // 1. Pesquisa local imediata para responsividade instantânea
  const localMatches = searchLocalFoods(query);
  searchResults.value = localMatches;

  // Evita consultar a API para termos de busca excessivamente curtos
  if (query.length < 3) return;

  searchLoading.value = true;
  try {
    const response = await fetch(`https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`, {
      headers: {
        'User-Agent': 'GymTrack - WebVue - Version 1.0 - https://github.com/GustavoRincha/projectGym'
      }
    });
    const data = await response.json();
    if (data && data.products) {
      const apiMatches = data.products
        .filter(p => p.product_name || p.product_name_pt)
        .slice(0, 15)
        .map(p => {
          const name = p.product_name_pt || p.product_name;
          const brand = p.brands ? ` (${p.brands})` : '';
          const nut = p.nutriments || {};
          return {
            name: `${name}${brand}`,
            calories: Math.round(nut['energy-kcal_100g'] || nut['energy-kcal'] || 0),
            protein: parseFloat(nut.proteins_100g || nut.proteins || 0),
            carbs: parseFloat(nut.carbohydrates_100g || nut.carbohydrates || 0),
            fat: parseFloat(nut.fat_100g || nut.fat || 0),
            baseAmount: 100,
            baseUnit: 'g'
          };
        });

      // Mescla os resultados priorizando a busca local específica
      searchResults.value = mergeResults(localMatches, apiMatches);
    }
  } catch (error) {
    console.error('Error searching food API:', error);
  } finally {
    searchLoading.value = false;
  }
};

let debounceTimeout = null;

// Watch para pesquisa conforme escreve (search-as-you-type) com debounce
watch(searchQuery, (newVal) => {
  const query = newVal.trim();
  if (!query) {
    searchResults.value = [];
    if (debounceTimeout) clearTimeout(debounceTimeout);
    return;
  }

  // Busca local instantânea
  searchResults.value = searchLocalFoods(query);

  // Cancela o debounce anterior
  if (debounceTimeout) clearTimeout(debounceTimeout);

  // Executa a busca na API do Open Food Facts apenas após 450ms sem digitar
  if (query.length >= 3) {
    debounceTimeout = setTimeout(() => {
      searchFoodApi();
    }, 450);
  }
});

const triggerQuickSearch = (kw) => {
  searchQuery.value = kw;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  searchFoodApi();
};

const applyApiFood = (res) => {
  selectedFoodBase.value = { ...res };
  foodForm.name = res.name;
  
  measureMode.value = res.baseUnit || 'g';
  amountInput.value = res.baseAmount || 100;
  
  foodForm.calories = res.calories;
  foodForm.protein = res.protein;
  foodForm.carbs = res.carbs;
  foodForm.fat = res.fat;
  
  searchResults.value = [];
};

// Watch para recalcular proporcionalmente as calorias e macronutrientes do formulário
watch([amountInput, measureMode], ([newAmount, newMode]) => {
  if (!selectedFoodBase.value) return;
  
  const base = selectedFoodBase.value;
  let multiplier = 1;
  
  if (base.baseUnit === newMode) {
    multiplier = newAmount / base.baseAmount;
  } else if (base.baseUnit === 'uni' && newMode === 'g' && base.weightPerUnit) {
    const inputInUnits = newAmount / base.weightPerUnit;
    multiplier = inputInUnits / base.baseAmount;
  } else if ((base.baseUnit === 'g' || base.baseUnit === 'ml') && newMode === 'uni') {
    multiplier = newAmount; // assume 1 unidade = 1 porção base (100g/100ml)
  } else {
    multiplier = newAmount / (base.baseAmount || 100);
  }
  
  if (isNaN(multiplier) || multiplier < 0) {
    multiplier = 0;
  }
  
  foodForm.calories = Math.round(base.calories * multiplier);
  foodForm.protein = Math.round((base.protein * multiplier) * 10) / 10;
  foodForm.carbs = Math.round((base.carbs * multiplier) * 10) / 10;
  foodForm.fat = Math.round((base.fat * multiplier) * 10) / 10;
});

const saveFoodItem = () => {
  if (!foodForm.name || !foodForm.calories) return;

  let portionText = '';
  if (measureMode.value === 'g') {
    portionText = `${amountInput.value}g`;
  } else if (measureMode.value === 'ml') {
    portionText = `${amountInput.value}ml`;
  } else {
    portionText = `${amountInput.value} uni`;
  }

  const food = {
    name: foodForm.name,
    calories: parseFloat(foodForm.calories) || 0,
    quantity: 1, // Calorias e macros salvos já são os finais calculados
    protein: parseFloat(foodForm.protein) || 0,
    carbs: parseFloat(foodForm.carbs) || 0,
    fat: parseFloat(foodForm.fat) || 0,
    portionText
  };

  // Se estamos editando, mantemos o mesmo ID para substituir no log
  if (isEditing.value && editingFoodId.value) {
    food.id = editingFoodId.value;
  }

  store.dispatch('body/logFood', {
    date: formattedDateKey.value,
    meal: activeMeal.value,
    food
  });

  foodDialog.value = false;
};

const deleteFoodItem = (mealKey, foodId) => {
  store.dispatch('body/deleteFood', {
    date: formattedDateKey.value,
    meal: mealKey,
    foodId
  });
};

// Dialog de Metas Manuais
const targetsDialog = ref(false);
const targetsForm = reactive({ calories: 2000, protein: 150, carbs: 200, fat: 67 });

watch(targetsDialog, (isOpen) => {
  if (isOpen) {
    targetsForm.calories = targets.value.calories;
    targetsForm.protein = targets.value.protein;
    targetsForm.carbs = targets.value.carbs;
    targetsForm.fat = targets.value.fat;
  }
});

const saveManualTargets = () => {
  store.dispatch('body/saveDietTargets', { ...targetsForm });
  targetsDialog.value = false;
};

// Calculadora TDEE
const calculatorDialog = ref(false);
const calcForm = reactive({ weight: 70, height: 170, age: 25, gender: 'male', activity: 1.375, goal: 'maintain' });

// Auto preenchimento ao abrir
watch(calculatorDialog, (isOpen) => {
  if (isOpen) {
    // Tentar ler peso mais recente e altura
    const lastWeight = store.getters['body/lastWeight'];
    const user = store.getters['auth/user'];
    
    if (lastWeight && lastWeight.value) {
      calcForm.weight = Math.round(lastWeight.value);
    }
    if (user && user.user_metadata) {
      const metadata = user.user_metadata;
      if (metadata.height) {
        const h = parseFloat(metadata.height);
        calcForm.height = Math.round(h > 3 ? h : h * 100);
      }
      if (metadata.birthdate) {
        const birth = new Date(metadata.birthdate);
        const age = new Date().getFullYear() - birth.getFullYear();
        calcForm.age = age || 25;
      }
    }
  }
});

const calculateAndApply = () => {
  const { weight, height, age, gender, activity, goal } = calcForm;
  if (!weight || !height || !age) return;

  // Fórmula de Mifflin-St Jeor
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // TDEE
  const tdee = Math.round(bmr * activity);

  // Meta de calorias baseada no objetivo
  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.max(tdee - 500, 1200); // Mínimo de 1200 kcal de segurança
  } else if (goal === 'gain') {
    targetCalories = tdee + 400;
  }

  // Distribuição de Macros recomendada para praticantes de atividade física
  // Proteína: ~2.0g/kg
  const protein = Math.round(2.0 * weight);
  // Gordura: ~0.8g/kg
  const fat = Math.round(0.8 * weight);
  // Carboidrato: restante das calorias
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const carbsKcal = Math.max(targetCalories - (proteinKcal + fatKcal), 0);
  const carbs = Math.round(carbsKcal / 4);

  store.dispatch('body/saveDietTargets', {
    calories: targetCalories,
    protein,
    carbs,
    fat
  });

  calculatorDialog.value = false;
};
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.border-bottom-thin {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.border-top-thin {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.text-xxs {
  font-size: 0.65rem !important;
}

/* Calorie Circle Progress styles */
.calorie-progress-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.calorie-progress-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.calorie-progress-svg circle {
  fill: none;
  stroke-width: 8px;
}

.calorie-progress-svg circle.track {
  stroke: rgba(255, 255, 255, 0.04);
}

.v-theme--gymLight .calorie-progress-svg circle.track {
  stroke: rgba(0, 0, 0, 0.04);
}

.calorie-progress-svg circle.progress {
  stroke: rgb(var(--v-theme-primary));
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.calorie-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
}

.glass-card {
  background: rgba(30, 30, 30, 0.65) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25) !important;
}

.v-theme--gymLight .glass-card {
  background: rgba(255, 255, 255, 0.75) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05) !important;
}

.gap-1 {
  gap: 4px;
}
.search-results-list {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
}
.v-theme--gymLight .search-results-list {
  background: rgba(0, 0, 0, 0.03);
}
.search-result-item {
  transition: background-color 0.2s ease;
}
.search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
.v-theme--gymLight .search-result-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
