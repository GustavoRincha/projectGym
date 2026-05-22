<template>
  <div class="active-workout pb-16">
    <div class="d-flex align-center mb-6 mt-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="cancelWorkout" class="mr-2"></v-btn>
      <h1 class="text-h5 font-weight-bold text-truncate" v-if="routine">{{ routine.name }}</h1>
    </div>

    <v-alert
      v-if="!routine"
      type="error"
      title="Treino não encontrado"
      text="Não foi possível carregar o treino selecionado."
    ></v-alert>

    <div v-else>
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="text-subtitle-1 text-medium-emphasis">Duração: {{ formattedTime }}</span>
      </div>

      <v-expansion-panels v-model="activePanel" multiple variant="accordion">
        <v-expansion-panel
          v-for="(group, groupIndex) in groupedExercises"
          :key="group.id"
          :value="group.id"
          class="mb-2 bg-surface"
          :class="{ 'border-l-4 border-l-secondary pl-2': group.isBiset }"
        >
          <v-expansion-panel-title>
            <div>
              <div v-if="group.isBiset" class="font-weight-black text-secondary text-caption uppercase mb-1">
                <v-icon icon="mdi-link-variant" size="x-small" class="mr-1"></v-icon>
                Bloco Bi-Set
              </div>
              <div class="font-weight-bold">
                <template v-if="group.isBiset">
                  {{ group.exercises.map(e => e.name).join(' + ') }}
                </template>
                <template v-else>
                  {{ groupIndex + 1 }}. {{ group.exercises[0].name }}
                </template>
              </div>
              <div class="text-caption text-medium-emphasis" v-if="!group.isBiset && group.exercises[0].cleanMachine">
                <v-icon icon="mdi-tools" size="x-small" class="mr-1"></v-icon>{{ group.exercises[0].cleanMachine }}
              </div>
              <div class="text-caption text-medium-emphasis" v-else-if="group.isBiset">
                <v-icon icon="mdi-tools" size="x-small" class="mr-1"></v-icon>
                {{ group.exercises.map(e => e.cleanMachine || 'Peso Corporal').join(' + ') }}
              </div>
              <div class="text-caption mt-1" v-if="!group.isBiset">
                <v-chip v-if="group.exercises[0].failureSets > 0 && group.exercises[0].failureSets === group.exercises[0].setsMax" size="x-small" color="secondary" class="mr-1">Todas até a Falha</v-chip>
                <template v-else>
                  <span class="text-primary font-weight-medium">{{ group.exercises[0].repsMin }}–{{ group.exercises[0].repsMax }} reps</span>
                  <v-chip v-if="group.exercises[0].failureSets > 0" size="x-small" color="secondary" class="ml-1">
                    Últim{{ group.exercises[0].failureSets > 1 ? `as ${group.exercises[0].failureSets}` : 'a' }} até a falha
                  </v-chip>
                </template>
              </div>
            </div>
            <v-spacer></v-spacer>
            <v-btn
              v-if="!group.isBiset && group.exercises[0].name"
              icon="mdi-help-circle-outline"
              variant="text"
              size="small"
              color="primary"
              class="mr-1"
              @click.stop="openGuide(group.exercises[0].name)"
            ></v-btn>
            <v-chip size="small" :color="isGroupComplete(group) ? 'success' : 'default'" class="mr-2">
              {{ getGroupCompletionText(group) }}
            </v-chip>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
            <div v-for="(ex, exIdx) in group.exercises" :key="ex.id" :class="{ 'mt-6 pt-6 border-t border-dashed': exIdx > 0 }">
              <!-- Nome do Exercício (Exibe apenas se for Bi-Set) -->
              <div v-if="group.isBiset" class="d-flex align-center justify-space-between mb-3 px-1">
                <span class="text-subtitle-2 font-weight-black text-secondary d-flex align-center">
                  <v-icon icon="mdi-play-circle-outline" class="mr-2" size="small"></v-icon>
                  {{ ex.name }}
                  <span class="text-caption text-medium-emphasis ml-2" v-if="ex.cleanMachine || ex.machine">
                    ({{ ex.cleanMachine || ex.machine }})
                  </span>
                </span>
                <v-btn
                  v-if="ex.name"
                  icon="mdi-help-circle-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="openGuide(ex.name)"
                ></v-btn>
              </div>

              <!-- Detalhes do Exercício se for Bi-Set -->
              <div v-if="group.isBiset" class="text-caption text-medium-emphasis mb-2 px-1">
                <span class="text-primary font-weight-medium mr-2">{{ ex.repsMin }}–{{ ex.repsMax }} reps</span>
                <v-chip v-if="ex.failureSets > 0" size="x-small" color="secondary">
                  Últim{{ ex.failureSets > 1 ? `as ${ex.failureSets}` : 'a' }} até a falha
                </v-chip>
              </div>

              <v-row class="font-weight-bold text-caption text-medium-emphasis mb-2">
                <v-col cols="2">Série</v-col>
                <v-col cols="4">Kg</v-col>
                <v-col cols="4">Reps</v-col>
                <v-col cols="2" class="text-center"><v-icon icon="mdi-check"></v-icon></v-col>
              </v-row>

              <v-row
                v-for="setIndex in Number(ex.setsMax || 0)"
                :key="setIndex"
                class="align-center mb-1"
                :class="{ 'failure-set-row': isFailureSet(ex, setIndex) }"
              >
                <v-col cols="2">
                  <div class="font-weight-bold">{{ setIndex }}</div>
                  <v-chip
                    v-if="isFailureSet(ex, setIndex)"
                    color="secondary"
                    size="x-small"
                    variant="tonal"
                    class="mt-1 px-1"
                  >
                    <v-icon icon="mdi-fire" size="x-small"></v-icon>
                  </v-chip>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model.number="ex.performed[setIndex - 1].weight"
                    type="number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    :bg-color="isFailureSet(ex, setIndex) ? 'rgba(255,109,0,0.1)' : 'background'"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model.number="ex.performed[setIndex - 1].reps"
                    type="number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    :bg-color="isFailureSet(ex, setIndex) ? 'rgba(255,109,0,0.1)' : 'background'"
                    :placeholder="isFailureSet(ex, setIndex) ? 'Falha' : ''"
                  ></v-text-field>
                </v-col>
                <v-col cols="2" class="text-center">
                  <v-checkbox-btn
                    v-model="ex.performed[setIndex - 1].completed"
                    color="success"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </v-col>
              </v-row>

              <!-- Observações do Exercício -->
              <v-textarea
                v-model="ex.notes"
                label="Observações do Exercício"
                placeholder="Como foi a execução?"
                variant="outlined"
                density="compact"
                rows="1"
                auto-grow
                class="mt-4"
                hide-details
                prepend-inner-icon="mdi-pencil-outline"
              ></v-textarea>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Registro de Cardio -->
      <v-card class="mt-4 bg-surface pa-4" elevation="1" rounded="lg">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-icon icon="mdi-heart-pulse" class="mr-2 text-secondary"></v-icon>
            <span class="font-weight-bold text-subtitle-2">Cardio Realizado</span>
          </div>
          <v-btn
            size="small"
            color="secondary"
            variant="tonal"
            prepend-icon="mdi-plus"
            @click="addCardioDialog = true"
          >
            Adicionar Cardio
          </v-btn>
        </div>

        <div v-if="sessionCardios.length === 0" class="text-caption text-medium-emphasis text-center py-3">
          Nenhum registro de cardio adicionado hoje.
        </div>
        <div v-else class="d-flex flex-column" style="gap: 12px;">
          <v-card
            v-for="(cardio, idx) in sessionCardios"
            :key="idx"
            variant="outlined"
            class="pa-3 bg-background border-dashed"
            rounded="lg"
          >
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon :icon="getCardioIcon(cardio.name)" class="mr-2 text-secondary" size="small"></v-icon>
                <span class="text-body-2 font-weight-bold">{{ cardio.name }}</span>
              </div>
              <div>
                <v-btn
                  icon="mdi-help-circle-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  class="mr-1"
                  @click="openGuide(cardio.name)"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="removeCardio(idx)"
                ></v-btn>
              </div>
            </div>

            <!-- Timer e Controles -->
            <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 12px;">
              <!-- Cronômetro Display -->
              <div class="d-flex align-center">
                <div class="text-h6 font-weight-black text-secondary mr-3" style="font-family: monospace; min-width: 65px;">
                  {{ formatCardioTime(cardio.elapsedTime || 0) }}
                </div>
                <!-- Play/Pause Button -->
                <v-btn
                  :icon="cardio.isRunning ? 'mdi-pause' : 'mdi-play'"
                  :color="cardio.isRunning ? 'warning' : 'success'"
                  variant="flat"
                  size="x-small"
                  class="mr-2"
                  @click="toggleCardioTimer(idx)"
                ></v-btn>
                <!-- Reset Button -->
                <v-btn
                  icon="mdi-refresh"
                  variant="tonal"
                  size="x-small"
                  @click="resetCardioTimer(idx)"
                ></v-btn>
              </div>

              <!-- Inputs Manuais (Tempo / Distância) -->
              <div class="d-flex align-center" style="gap: 8px; max-width: 220px;">
                <v-text-field
                  :model-value="cardio.duration"
                  label="Tempo (min)"
                  type="number"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 90px;"
                  @update:model-value="val => updateCardioManual(idx, 'duration', val)"
                ></v-text-field>
                <v-text-field
                  :model-value="cardio.distance"
                  label="Dist (km)"
                  type="number"
                  step="0.1"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 90px;"
                  @update:model-value="val => updateCardioManual(idx, 'distance', val)"
                ></v-text-field>
              </div>
            </div>
          </v-card>
        </div>
      </v-card>

      <!-- Anotações Gerais do Treino -->
      <v-card class="mt-4 bg-surface pa-4" elevation="1" rounded="lg">
        <div class="d-flex align-center mb-2">
          <v-icon icon="mdi-note-text-outline" class="mr-2 text-primary"></v-icon>
          <span class="font-weight-bold text-subtitle-2">Anotações Gerais do Treino</span>
        </div>
        <v-textarea
          v-model="workoutNotes"
          placeholder="Como foi o treino hoje? Anote cansaço, pump, disposição, etc..."
          variant="outlined"
          auto-grow
          rows="2"
          density="comfortable"
          hide-details
        ></v-textarea>
      </v-card>

      <!-- Botões de Ação -->
      <div class="d-flex flex-column mt-6" style="gap: 12px;">
        <v-btn
          color="secondary"
          size="large"
          block
          rounded="pill"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="addExerciseDialog = true"
        >
          Adicionar Exercício
        </v-btn>

        <v-btn
          color="primary"
          size="large"
          block
          rounded="pill"
          @click="finishWorkout"
        >
          Finalizar Treino
        </v-btn>
      </div>
    </div>

    <!-- Add Exercise Dialog -->
    <v-dialog v-model="addExerciseDialog" max-width="450">
      <v-card color="surface">
        <v-card-title class="text-h6 pt-4 px-4 font-weight-bold">Adicionar Exercício</v-card-title>
        <v-card-text class="px-4 pt-2">
          <v-combobox
            v-model="newExerciseForm.name"
            :items="existingExerciseNames"
            label="Nome do Exercício"
            placeholder="Ex: Supino Reto, Leg Press..."
            variant="outlined"
            density="comfortable"
            class="mb-3"
            autofocus
          ></v-combobox>

          <v-combobox
            v-model="newExerciseForm.machine"
            :items="commonMachines"
            label="Equipamento / Máquina"
            placeholder="Ex: Halteres, Barra Livre..."
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-combobox>

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="newExerciseForm.sets"
                label="Séries"
                type="number"
                min="1"
                max="10"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newExerciseForm.reps"
                label="Reps Alvo"
                type="number"
                min="1"
                max="100"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="addExerciseDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmAddExercise" :disabled="!newExerciseForm.name">Adicionar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Cardio Dialog -->
    <v-dialog v-model="addCardioDialog" max-width="400">
      <v-card color="surface">
        <v-card-title class="text-h6 pt-4 px-4 font-weight-bold">Registrar Cardio</v-card-title>
        <v-card-text class="px-4 pt-2">
          <v-combobox
            v-model="newCardioForm.name"
            :items="cardioOptions"
            label="Tipo de Cardio"
            placeholder="Selecione ou digite o tipo..."
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-combobox>

          <v-text-field
            v-model.number="newCardioForm.duration"
            label="Duração (minutos)"
            type="number"
            min="1"
            max="300"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model.number="newCardioForm.distance"
            label="Distância (km) - Opcional"
            type="number"
            min="0"
            step="0.1"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="addCardioDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmAddCardio" :disabled="!newCardioForm.name || !newCardioForm.duration">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card color="surface">
        <v-card-title class="text-h6 pt-4 px-4">Cancelar Treino?</v-card-title>
        <v-card-text class="px-4 text-medium-emphasis">
          Deseja realmente cancelar este treino? O progresso não será salvo.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelDialog = false">Voltar</v-btn>
          <v-btn color="error" variant="flat" @click="confirmCancel">Sim, Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      <v-icon icon="mdi-check-circle" class="mr-2"></v-icon>
      {{ snackbar.text }}
    </v-snackbar>

    <!-- Dialog de Guia de Execução -->
    <ExerciseGuideDialog v-model="guideDialog" :exercise-name="selectedExerciseForGuide" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ExerciseGuideDialog from '@/components/ExerciseGuideDialog.vue';
import { groupExercises, parseMachine } from '@/utils/workoutHelpers';
import { mediaSessionService } from '@/services/mediaSessionService';

const route = useRoute();
const router = useRouter();
const store = useStore();

const guideDialog = ref(false);
const selectedExerciseForGuide = ref('');

const openGuide = (name) => {
  selectedExerciseForGuide.value = name;
  guideDialog.value = true;
};

const routineId = route.params.id;
const routine = computed(() => store.getters['workouts/getRoutineById'](routineId));

// State for the ongoing session
const sessionExercises = ref([]);
const sessionCardios = computed(() => store.state.session.cardios || []);
const activePanel = ref([]);

const groupedExercises = computed(() => {
  return groupExercises(sessionExercises.value);
});

const getGroupCompletionText = (group) => {
  if (!group.isBiset) {
    return `${completedSetsCount(group.exercises[0])}/${group.exercises[0].setsMax}`;
  }
  return group.exercises.map(ex => `${completedSetsCount(ex)}/${ex.setsMax}`).join(' + ');
};

const isGroupComplete = (group) => {
  return group.exercises.every(ex => isExerciseComplete(ex));
};

const elapsedTime = computed(() => store.getters['session/elapsedTime']);

const formattedTime = computed(() => {
  const mins = Math.floor((elapsedTime.value || 0) / 60);
  const secs = (elapsedTime.value || 0) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

// Encontra o exercício e a série ativos atuais
const getActiveExerciseAndSet = () => {
  if (!sessionExercises.value || sessionExercises.value.length === 0) {
    return { name: 'Sem Exercícios', setInfo: '-' };
  }

  // Encontra o primeiro exercício que ainda tem séries incompletas
  const activeEx = sessionExercises.value.find(ex => {
    const completedCount = ex.performed.filter(s => s.completed).length;
    return completedCount < ex.setsMax;
  });

  if (!activeEx) {
    return { name: 'Treino Concluído!', setInfo: 'Finalizar' };
  }

  // Encontra o index da primeira série incompleta
  const currentSetIndex = activeEx.performed.findIndex(s => !s.completed) + 1;
  const totalSets = activeEx.setsMax;

  return {
    name: activeEx.name,
    setInfo: `${currentSetIndex}/${totalSets}`
  };
};

// Marca a próxima série pendente como concluída (usado pelo botão físico Next de mídia)
const marcarProximaSerieComoConcluida = () => {
  if (!sessionExercises.value || sessionExercises.value.length === 0) return;

  const activeEx = sessionExercises.value.find(ex => {
    const completedCount = ex.performed.filter(s => s.completed).length;
    return completedCount < ex.setsMax;
  });

  if (activeEx) {
    const incompleteSet = activeEx.performed.find(s => !s.completed);
    if (incompleteSet) {
      incompleteSet.completed = true;
      
      // Se era a última série deste exercício, expande o próximo grupo se aplicável
      const completedCountAfter = activeEx.performed.filter(s => s.completed).length;
      if (completedCountAfter === activeEx.setsMax) {
        const currentGroupIndex = groupedExercises.value.findIndex(g => g.exercises.some(e => e.id === activeEx.id));
        if (currentGroupIndex !== -1 && currentGroupIndex + 1 < groupedExercises.value.length) {
          const nextGroup = groupedExercises.value[currentGroupIndex + 1];
          if (!activePanel.value.includes(nextGroup.id)) {
            activePanel.value = [...activePanel.value, nextGroup.id];
          }
        }
      }
    }
  }
};

// Desmarca a última série que foi concluída (usado pelo botão físico Prev de mídia)
const desmarcarSerieAnterior = () => {
  if (!sessionExercises.value || sessionExercises.value.length === 0) return;

  let activeEx = null;
  let completedSet = null;

  // Busca do último exercício para o primeiro
  for (let i = sessionExercises.value.length - 1; i >= 0; i--) {
    const ex = sessionExercises.value[i];
    const revIndex = [...ex.performed].reverse().findIndex(s => s.completed);
    if (revIndex !== -1) {
      activeEx = ex;
      const actualIndex = ex.performed.length - 1 - revIndex;
      completedSet = ex.performed[actualIndex];
      break;
    }
  }

  if (completedSet) {
    completedSet.completed = false;
  }
};

// Monitora o tempo decorrido e atualiza a tela bloqueada/central de notificações
watch(elapsedTime, () => {
  if (store.getters['session/isActive']) {
    const { name, setInfo } = getActiveExerciseAndSet();
    mediaSessionService.updateLockScreen(name, setInfo, formattedTime.value);
  }
});

onMounted(() => {
  const isActive = store.getters['session/isActive'];
  const activeId = store.getters['session/routineId'];

  if (isActive) {
    if (activeId !== routineId) {
      alert('Você já possui um treino em andamento. Retornando ao treino ativo...');
      router.push(`/workout/${activeId}`);
      return;
    }
  } else {
    if (routine.value) {
      store.dispatch('session/startSession', routine.value);
    }
  }

  // Carrega os exercícios do estado global
  const storedExercises = store.getters['session/exercises'];
  if (storedExercises && storedExercises.length > 0) {
    sessionExercises.value = JSON.parse(JSON.stringify(storedExercises));
    if (groupedExercises.value.length > 0) {
      activePanel.value = [groupedExercises.value[0].id];
    }
  }

  // Ativa a Media Session e vincula os controles físicos do player
  mediaSessionService.startBackgroundMode();
  mediaSessionService.setupControls({
    onNextTrack: marcarProximaSerieComoConcluida,
    onPreviousTrack: desmarcarSerieAnterior
  });
});

onUnmounted(() => {
  // Desativa o áudio de fundo ao sair da tela
  mediaSessionService.stopBackgroundMode();
});

// Sincroniza qualquer alteração no formulário com o estado global (para persistência no localStorage)
watch(sessionExercises, (newVal) => {
  if (newVal.length > 0) {
    store.commit('session/UPDATE_ALL_EXERCISES', newVal);
  }
}, { deep: true });

const completedSetsCount = (ex) => {
  return ex.performed.filter(s => s.completed).length;
};

const isExerciseComplete = (ex) => {
  return completedSetsCount(ex) === ex.setsMax;
};

// Retorna true se a série setIndex (1-based) é uma das últimas N séries até a falha
const isFailureSet = (ex, setIndex) => {
  if (!ex.failureSets || ex.failureSets === 0) return false;
  return setIndex > ex.setsMax - ex.failureSets;
};

// UI State
const cancelDialog = ref(false);
const snackbar = reactive({ show: false, text: '', color: 'success' });

// Workout Notes
const workoutNotes = computed({
  get: () => store.state.session.notes || '',
  set: (val) => store.commit('session/UPDATE_SESSION_NOTES', val)
});

// Add Cardio dialog states & form
const addCardioDialog = ref(false);
const newCardioForm = reactive({ name: '', duration: '', distance: '' });
const cardioOptions = [
  'Esteira (Corrida/Caminhada)',
  'Bicicleta Ergométrica',
  'Elíptico',
  'Escada',
  'Corda',
  'Outro'
];

const formatCardioTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const toggleCardioTimer = (idx) => {
  store.commit('session/TOGGLE_CARDIO_TIMER', idx);
};

const resetCardioTimer = (idx) => {
  store.commit('session/RESET_CARDIO_TIMER', idx);
};

const updateCardioManual = (idx, key, val) => {
  store.commit('session/UPDATE_CARDIO_MANUAL', {
    index: idx,
    key,
    value: val === '' ? null : Number(val)
  });
};

const getCardioIcon = (name) => {
  if (!name || typeof name !== 'string') return 'mdi-heart-pulse';
  if (name.includes('Esteira') || name.includes('Corrida') || name.includes('Caminhada')) return 'mdi-run';
  if (name.includes('Bicicleta') || name.includes('Bike')) return 'mdi-bike';
  if (name.includes('Elíptico')) return 'mdi-walk';
  if (name.includes('Escada')) return 'mdi-stairs';
  if (name.includes('Corda')) return 'mdi-jump-rope';
  return 'mdi-heart-pulse';
};

const confirmAddCardio = () => {
  if (!newCardioForm.name) return;

  const durationVal = newCardioForm.duration ? Number(newCardioForm.duration) : 20;

  const newCardioObj = {
    name: newCardioForm.name,
    duration: durationVal,
    distance: newCardioForm.distance ? Number(newCardioForm.distance) : null,
    elapsedTime: 0,
    isRunning: false
  };

  store.commit('session/UPDATE_ALL_CARDIOS', [...sessionCardios.value, newCardioObj]);

  // Clear form & close dialog
  newCardioForm.name = '';
  newCardioForm.duration = '';
  newCardioForm.distance = '';
  addCardioDialog.value = false;
};

const removeCardio = (index) => {
  const filtered = sessionCardios.value.filter((_, idx) => idx !== index);
  store.commit('session/UPDATE_ALL_CARDIOS', filtered);
};

// Add Exercise dialog states & list configs
const addExerciseDialog = ref(false);
const newExerciseForm = reactive({ name: '', machine: '', sets: 3, reps: 15 });
const commonMachines = ['Barra Livre', 'Halteres', 'Polia', 'Máquina Articulada', 'Crossover', 'Peso Corporal', 'Kettlebell'];

const allRoutines = computed(() => store.getters['workouts/allRoutines']);
const existingExerciseNames = computed(() => {
  const names = new Set();
  const defaults = [
    'Supino Reto', 'Supino Inclinado', 'Agachamento Livre', 'Levantamento Terra', 
    'Rosca Direta', 'Rosca Alternada', 'Tríceps Pulley', 'Tríceps Testa', 
    'Elevação Lateral', 'Desenvolvimento Halteres', 'Puxada Frente', 'Remada Curvada', 
    'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Panturrilha Sentado'
  ];
  defaults.forEach(d => names.add(d));
  if (allRoutines.value) {
    allRoutines.value.forEach(r => {
      if (r.exercises) {
        r.exercises.forEach(ex => {
          if (ex.name) names.add(ex.name);
        });
      }
    });
  }
  return Array.from(names).sort();
});

const confirmAddExercise = () => {
  if (!newExerciseForm.name || !newExerciseForm.name.trim()) return;

  const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const setsCount = Number(newExerciseForm.sets) || 3;
  const repsCount = Number(newExerciseForm.reps) || 15;

  const newExercise = {
    id: newId,
    name: newExerciseForm.name.trim(),
    machine: newExerciseForm.machine || '',
    setsMax: setsCount,
    setsMin: setsCount,
    repsMin: repsCount,
    repsMax: repsCount,
    failureSets: 0,
    performed: Array.from({ length: setsCount }, () => ({
      weight: 0,
      reps: repsCount,
      completed: false
    })),
    notes: ''
  };

  sessionExercises.value.push(newExercise);

  // Clear form & close
  addExerciseDialog.value = false;
  newExerciseForm.name = '';
  newExerciseForm.machine = '';
  newExerciseForm.sets = 3;
  newExerciseForm.reps = 15;

  // Open the new panel
  const newIndex = sessionExercises.value.length - 1;
  if (!activePanel.value.includes(newIndex)) {
    activePanel.value = [...activePanel.value, newIndex];
  }
};

const showMessage = (text, color = 'success') => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

const cancelWorkout = () => {
  cancelDialog.value = true;
};

const confirmCancel = () => {
  cancelDialog.value = false;
  mediaSessionService.stopBackgroundMode();
  store.dispatch('session/clearSession');
  router.push('/');
};

const finishWorkout = async () => {
  const exercisesToSave = JSON.parse(JSON.stringify(sessionExercises.value));
  
  // Append cardio objects
  if (sessionCardios.value && sessionCardios.value.length > 0) {
    sessionCardios.value.forEach((cardio, idx) => {
      const finalDuration = (cardio.elapsedTime && cardio.elapsedTime > 0)
        ? Math.ceil(cardio.elapsedTime / 60)
        : (Number(cardio.duration) || 0);

      exercisesToSave.push({
        id: `session-cardio-meta-${idx}`,
        name: cardio.name,
        duration: finalDuration,
        distance: cardio.distance || null,
        isCardio: true,
        performed: []
      });
    });
  }

  if (workoutNotes.value && workoutNotes.value.trim()) {
    exercisesToSave.push({
      id: 'session-notes-meta',
      name: 'Observações do Treino',
      notes: workoutNotes.value.trim(),
      isNotes: true,
      performed: []
    });
  }

  const sessionData = {
    routineId:    routine.value.id,
    routineName:  routine.value.name,
    date:         new Date().toISOString(),
    duration:     elapsedTime.value,
    exercises:    exercisesToSave
  };

  // Save session first so rootState has it for badge checking
  await store.dispatch('history/saveSession', sessionData);

  // Award XP for finishing a workout
  await store.dispatch('gamification/addXp', 50);

  // Calculate streak for badge checking
  const sessions = store.getters['history/allSessions'];
  const sessionDateSet = new Set(sessions.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (sessionDateSet.has(key)) streak++;
    else if (i > 0) break;
  }

  // Check and unlock badges
  await store.dispatch('gamification/checkAndUnlockBadges', { sessionData, streak });

  mediaSessionService.stopBackgroundMode();
  store.dispatch('session/clearSession');

  showMessage('Treino finalizado! +50 XP ganhos!', 'success');
  
  setTimeout(() => {
    router.push('/history');
  }, 1500);
};
</script>
