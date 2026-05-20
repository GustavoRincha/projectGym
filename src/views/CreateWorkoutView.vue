<template>
  <div class="create-workout pb-16">
    <div class="d-flex align-center mb-6 mt-4">
      <v-btn icon="mdi-arrow-left" variant="text" to="/workouts" class="mr-2"></v-btn>
      <h1 class="text-h5 font-weight-bold">{{ isEditMode ? 'Editar Treino' : 'Novo Treino' }}</h1>
    </div>

    <!-- Step 1: Detalhes do Treino -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4 border-t-4 border-t-primary">
      <h2 class="text-h6 font-weight-bold mb-4">Informações Gerais</h2>
      
      <v-text-field
        v-model="workout.name"
        label="Nome do Treino (Ex: Treino A - Peito)"
        variant="outlined"
        bg-color="background"
        class="mb-2"
      ></v-text-field>

      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="workout.objective"
            :items="objectives"
            label="Objetivo do Treino"
            variant="outlined"
            bg-color="background"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="workout.split"
            :items="splits"
            label="Divisão de Treino"
            variant="outlined"
            bg-color="background"
          ></v-select>
        </v-col>
      </v-row>

      <div class="mt-2">
        <label class="text-subtitle-2 text-medium-emphasis mb-2 d-block">Dias da Semana</label>
        <v-chip-group v-model="workout.daysOfWeek" column multiple selected-class="bg-primary text-background">
          <v-chip v-for="day in weekDays" :key="day.value" :value="day.value" filter>
            {{ day.text }}
          </v-chip>
        </v-chip-group>
      </div>
    </v-card>

    <!-- Step 2: Exercícios de Musculação -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4 border-t-4 border-t-secondary">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h6 font-weight-bold">Exercícios de Musculação</h2>
        <v-btn color="secondary" size="small" variant="tonal" prepend-icon="mdi-plus" @click="addExercise">
          Adicionar Exercício
        </v-btn>
      </div>

      <div v-if="musculationExercises.length === 0" class="text-center py-4 text-medium-emphasis">
        Nenhum exercício de musculação adicionado ainda.
      </div>

      <v-expansion-panels v-else v-model="openPanels" multiple variant="accordion" class="mb-4">
        <v-expansion-panel
          v-for="(ex, index) in musculationExercises"
          :key="ex.id"
          :value="ex.id"
          class="bg-background mb-2"
        >
          <v-expansion-panel-title>
            <span class="font-weight-bold">{{ index + 1 }}. {{ ex.name || 'Novo Exercício' }}</span>
            <template v-slot:actions>
              <v-btn
                v-if="ex.name"
                icon="mdi-help-circle-outline"
                variant="text"
                size="small"
                color="primary"
                class="mr-1"
                @click.stop="openGuide(ex.name)"
              ></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" class="mr-1" @click.stop="removeExerciseById(ex.id)"></v-btn>
              <v-icon icon="mdi-chevron-down"></v-icon>
            </template>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
            <!-- Nome e Máquina -->
            <v-row dense class="mt-2">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="ex.name"
                  label="Nome do Exercício"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="ex.machine"
                  :items="commonMachines"
                  label="Máquina / Equipamento"
                  variant="outlined"
                  density="compact"
                ></v-combobox>
              </v-col>
            </v-row>

            <!-- Séries -->
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model.number="ex.setsMin"
                  label="Séries (Mín)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :min="1"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="ex.setsMax"
                  label="Séries (Máx)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :min="ex.setsMin"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Repetições: mín / máx + Até a Falha -->
            <div class="mb-2">
              <label class="text-subtitle-2 text-medium-emphasis d-block mb-1">Repetições</label>

              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="ex.repsMin"
                    label="Reps Mínimo"
                    type="number"
                    variant="outlined"
                    density="compact"
                    :min="1"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="ex.repsMax"
                    label="Reps Máximo"
                    type="number"
                    variant="outlined"
                    density="compact"
                    :min="ex.repsMin"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Séries até a falha -->
              <div class="mt-1">
                <label class="text-caption text-medium-emphasis d-block mb-1">
                  Séries até a falha (das {{ ex.setsMax }} séries)
                </label>
                <v-chip-group
                  v-model="ex.failureSets"
                  mandatory
                  selected-class="bg-secondary text-background"
                  class="flex-wrap"
                >
                  <v-chip :value="0" size="small">Nenhuma</v-chip>
                  <v-chip
                    v-for="n in ex.setsMax"
                    :key="n"
                    :value="n"
                    size="small"
                  >
                    {{ n === ex.setsMax ? `${n} (Todas)` : `Última${n > 1 ? 's ' + n : ''}` }}
                  </v-chip>
                </v-chip-group>
                <v-alert
                  v-if="ex.failureSets > 0"
                  type="warning"
                  density="compact"
                  variant="tonal"
                  class="mt-2 text-body-2"
                >
                  <span v-if="ex.failureSets === ex.setsMax">Todas as {{ ex.setsMax }} séries serão até a falha muscular.</span>
                  <span v-else>
                    {{ ex.failureSets === 1 ? 'A última série' : `As últimas ${ex.failureSets} séries` }} serão até a falha muscular, as restantes com {{ ex.repsMin }}–{{ ex.repsMax }} reps.
                  </span>
                </v-alert>
              </div>
            </div>

            <!-- Peso e Progressão de Carga -->
            <div class="mb-2">
              <label class="text-subtitle-2 text-medium-emphasis d-block mb-2">Peso e Progressão de Carga</label>
              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="ex.weight"
                    label="Peso Inicial (kg)"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="ex.progressionType"
                    :items="progressionTypes"
                    item-title="label"
                    item-value="value"
                    label="Tipo de Progressão"
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row dense v-if="ex.progressionType !== 'none'">
                <v-col cols="6" v-if="ex.progressionType === 'fixed' || ex.progressionType === 'percentage'">
                  <v-text-field
                    v-model.number="ex.progressionValue"
                    :label="ex.progressionType === 'fixed' ? 'Acréscimo (kg)' : 'Acréscimo (%)'"
                    type="number"
                    variant="outlined"
                    density="compact"
                    :min="0"
                    :step="ex.progressionType === 'percentage' ? 1 : 0.5"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" v-if="ex.progressionType !== 'none'">
                  <v-select
                    v-model="ex.progressionFrequency"
                    :items="progressionFrequencies"
                    item-title="label"
                    item-value="value"
                    label="A cada"
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row dense class="mt-2">
                <v-col cols="12">
                  <v-text-field
                    v-model.number="ex.progressionPerSet"
                    label="Aumento por Série (kg)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hint="Aumento de carga entre cada série de um mesmo exercício. Ex: 2kg por série"
                    persistent-hint
                    :min="0"
                    :step="0.5"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-alert
                v-if="ex.progressionType !== 'none' && progressionSummary(ex)"
                type="info"
                density="compact"
                variant="tonal"
                class="mt-1"
              >
                {{ progressionSummary(ex) }}
              </v-alert>
            </div>

          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- Step 3: Cardio -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4 border-t-4 border-t-accent">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h6 font-weight-bold">Metas de Cardio</h2>
        <v-btn color="accent" size="small" variant="tonal" prepend-icon="mdi-plus" @click="addCardio">
          Adicionar Cardio
        </v-btn>
      </div>

      <div v-if="cardioExercises.length === 0" class="text-center py-4 text-medium-emphasis">
        Nenhuma meta de cardio adicionada ainda.
      </div>

      <v-expansion-panels v-else v-model="openPanels" multiple variant="accordion" class="mb-4">
        <v-expansion-panel
          v-for="(cEx, index) in cardioExercises"
          :key="cEx.id"
          :value="cEx.id"
          class="bg-background mb-2"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon icon="mdi-heart-pulse" class="mr-2 text-accent"></v-icon>
              <span class="font-weight-bold">{{ index + 1 }}. {{ cEx.name || 'Nova Meta de Cardio' }}</span>
            </div>
            <template v-slot:actions>
              <v-btn
                v-if="cEx.name"
                icon="mdi-help-circle-outline"
                variant="text"
                size="small"
                color="primary"
                class="mr-1"
                @click.stop="openGuide(cEx.name)"
              ></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" class="mr-1" @click.stop="removeExerciseById(cEx.id)"></v-btn>
              <v-icon icon="mdi-chevron-down"></v-icon>
            </template>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
            <v-row dense class="mt-2">
              <v-col cols="12" sm="4">
                <v-combobox
                  v-model="cEx.name"
                  :items="cardioOptions"
                  label="Tipo de Cardio"
                  variant="outlined"
                  density="compact"
                ></v-combobox>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="cEx.setsMax"
                  label="Meta de Tempo (minutos)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  min="1"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="cEx.repsMax"
                  label="Meta de Distância (km) - Opcional"
                  type="number"
                  step="0.1"
                  variant="outlined"
                  density="compact"
                  min="0"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <v-btn color="primary" block size="large" rounded="pill" @click="saveWorkout">
      {{ isEditMode ? 'Atualizar Treino' : 'Salvar Treino' }}
    </v-btn>

    <!-- Floating Action Button (FAB) para Adicionar Exercício -->
    <v-btn
      icon="mdi-plus"
      color="secondary"
      size="large"
      elevation="8"
      position="fixed"
      location="bottom right"
      style="bottom: 80px; right: 24px; z-index: 99;"
      @click="addExercise"
    ></v-btn>

    <!-- Dialog para confirmação de saída -->
    <v-dialog v-model="showLeaveConfirmDialog" max-width="400">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4 text-warning">
          <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>Descartar Alterações?
        </v-card-title>
        <v-card-text class="px-4 py-2 text-medium-emphasis">
          Você tem alterações não salvas no treino. Tem certeza que deseja sair? O progresso feito será perdido.
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showLeaveConfirmDialog = false">Continuar Editando</v-btn>
          <v-btn color="error" variant="flat" @click="confirmLeave">Descartar e Sair</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para alertas -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog de Guia de Execução -->
    <ExerciseGuideDialog v-model="guideDialog" :exercise-name="selectedExerciseForGuide" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import ExerciseGuideDialog from '@/components/ExerciseGuideDialog.vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

const guideDialog = ref(false);
const selectedExerciseForGuide = ref('');

const openGuide = (name) => {
  selectedExerciseForGuide.value = name;
  guideDialog.value = true;
};

// Edit mode: exists when there is a routineId in the route params
const editId = route.params.id || null;
const isEditMode = computed(() => !!editId);

// Controla quais painéis de exercício estão abertos (por id)
const openPanels = ref([]);

// Constants
const objectives = ['Hipertrofia', 'Treino de Força (Powerlifting)', 'Resistência Muscular', 'Potência Muscular'];
const splits = ['Full Body', 'AB', 'ABC', 'ABCD', 'ABCDE'];
const weekDays = [
  { text: 'Dom', value: 0 },
  { text: 'Seg', value: 1 },
  { text: 'Ter', value: 2 },
  { text: 'Qua', value: 3 },
  { text: 'Qui', value: 4 },
  { text: 'Sex', value: 5 },
  { text: 'Sáb', value: 6 },
];
const commonMachines = ['Barra Livre', 'Halteres', 'Polia', 'Máquina Articulada', 'Crossover', 'Peso Corporal', 'Kettlebell'];

const progressionTypes = [
  { label: 'Sem Progressão', value: 'none' },
  { label: 'Acréscimo Fixo (kg)', value: 'fixed' },
  { label: 'Acréscimo Percentual (%)', value: 'percentage' },
  { label: 'Dupla Progressão (Reps → Carga)', value: 'double' },
];

const progressionFrequencies = [
  { label: 'Toda sessão', value: 'every_session' },
  { label: 'A cada semana', value: 'weekly' },
  { label: 'A cada 2 semanas', value: 'biweekly' },
  { label: 'A cada mês', value: 'monthly' },
];

// State
const workout = reactive({
  name: '',
  objective: 'Hipertrofia',
  split: 'ABC',
  daysOfWeek: [],
  exercises: []
});

// Leave/Dirty State refs
const originalWorkoutData = ref('');
const isSaved = ref(false);
const showLeaveConfirmDialog = ref(false);
const toRoute = ref(null);
const allowLeave = ref(false);

const isDirty = computed(() => {
  if (isSaved.value) return false;
  return originalWorkoutData.value !== JSON.stringify(workout);
});

const musculationExercises = computed(() => {
  return workout.exercises.filter(ex => ex.machine !== 'Cardio');
});

const cardioExercises = computed(() => {
  return workout.exercises.filter(ex => ex.machine === 'Cardio');
});

const cardioOptions = [
  'Esteira (Corrida/Caminhada)',
  'Bicicleta Ergométrica',
  'Elíptico',
  'Escada',
  'Corda',
  'Outro'
];

// If in edit mode, load existing routine data into workout
onMounted(() => {
  if (isEditMode.value) {
    const existing = store.getters['workouts/getRoutineById'](editId);
    if (existing) {
      // Deep clone to avoid mutating the store directly
      const clone = JSON.parse(JSON.stringify(existing));
      workout.name = clone.name;
      workout.objective = clone.objective || 'Hipertrofia';
      workout.split = clone.split || 'ABC';
      workout.daysOfWeek = clone.daysOfWeek || [];
      workout.exercises = clone.exercises || [];
      // Open all panels so user can see the exercises immediately
      openPanels.value = workout.exercises.map(ex => ex.id);
    }
  }
  
  // Store the stringified representation of the workout at mount time
  originalWorkoutData.value = JSON.stringify(workout);

  // Register browser beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

const handleBeforeUnload = (e) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onBeforeRouteLeave((to, from) => {
  if (allowLeave.value || !isDirty.value) {
    return true;
  }
  toRoute.value = to;
  showLeaveConfirmDialog.value = true;
  return false; // Blocks navigation
});

const confirmLeave = () => {
  allowLeave.value = true;
  showLeaveConfirmDialog.value = false;
  if (toRoute.value) {
    router.push(toRoute.value);
  }
};

const addExercise = () => {
  const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  workout.exercises.push({
    id: newId,
    name: '',
    machine: '',
    setsMin: 3,
    setsMax: 4,
    // Campos de reps
    repsMin: 8,
    repsMax: 12,
    failureSets: 0, // 0 = nenhuma série até a falha; N = as últimas N séries são até a falha
    // Peso + progressão
    weight: 0,
    progressionType: 'fixed',
    progressionValue: 2.5,
    progressionFrequency: 'weekly',
    progressionPerSet: 0,
  });

  // Auto-abre o painel do exercício recém-adicionado
  openPanels.value = [...openPanels.value, newId];
};

const addCardio = () => {
  const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  workout.exercises.push({
    id: newId,
    name: 'Esteira (Corrida/Caminhada)',
    machine: 'Cardio',
    setsMin: 1,
    setsMax: 20, // Meta de Tempo padrão
    repsMin: 0,
    repsMax: 0, // Meta de Distância padrão (opcional)
    failureSets: 0,
    weight: 0,
    progressionType: 'none',
    progressionValue: 0,
    progressionFrequency: 'weekly',
    progressionPerSet: 0,
  });

  openPanels.value = [...openPanels.value, newId];
};

const removeExerciseById = (id) => {
  openPanels.value = openPanels.value.filter(panelId => panelId !== id);
  const idx = workout.exercises.findIndex(ex => ex.id === id);
  if (idx !== -1) {
    workout.exercises.splice(idx, 1);
  }
};

// Snackbar state
const snackbar = reactive({ show: false, text: '', color: 'success' });
const showMessage = (text, color = 'success') => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

// Gera uma frase resumindo a progressão configurada
const progressionSummary = (ex) => {
  const freqMap = {
    every_session: 'toda sessão',
    weekly: 'toda semana',
    biweekly: 'a cada 2 semanas',
    monthly: 'todo mês',
  };

  if (ex.progressionType === 'fixed' && ex.progressionValue > 0) {
    return `Aumentar +${ex.progressionValue}kg ${freqMap[ex.progressionFrequency] || ''}.`;
  }
  if (ex.progressionType === 'percentage' && ex.progressionValue > 0) {
    return `Aumentar +${ex.progressionValue}% do peso ${freqMap[ex.progressionFrequency] || ''}.`;
  }
  if (ex.progressionType === 'double') {
    return `Dupla progressão: quando atingir ${ex.repsMax} reps em todas as séries, aumente a carga ${freqMap[ex.progressionFrequency] || ''}.`;
  }
  return '';
};

const saveWorkout = () => {
  if (!workout.name) {
    showMessage('Por favor, informe o nome do treino.', 'error');
    return;
  }
  if (workout.exercises.length === 0) {
    showMessage('Adicione pelo menos um exercício.', 'error');
    return;
  }
  
  // Disable dirty check warning on successful save
  isSaved.value = true;

  // Clone object before saving
  const routineData = JSON.parse(JSON.stringify(workout));
  
  if (isEditMode.value) {
    // Update existing — keep the original id
    store.dispatch('workouts/updateRoutine', { ...routineData, id: editId });
    showMessage('Treino atualizado com sucesso!', 'success');
  } else {
    store.dispatch('workouts/addRoutine', routineData);
    showMessage('Treino salvo com sucesso!', 'success');
  }
  
  setTimeout(() => {
    router.push('/workouts');
  }, 1000);
};
</script>
