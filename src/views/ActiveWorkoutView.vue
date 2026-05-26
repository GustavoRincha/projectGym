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

              <v-row class="font-weight-bold text-caption text-medium-emphasis mb-2 align-center">
                <v-col cols="2">Série</v-col>
                <v-col cols="4">Kg</v-col>
                <v-col cols="4">Reps</v-col>
                <v-col cols="2" class="text-center d-flex justify-center align-center py-0">
                  <v-btn
                    icon
                    variant="text"
                    size="x-small"
                    :color="allSetsCompleted(ex) ? 'success' : 'medium-emphasis'"
                    @click="toggleAllSets(ex)"
                    class="my-n2"
                    title="Marcar/Desmarcar todas"
                  >
                    <v-icon :icon="allSetsCompleted(ex) ? 'mdi-check-all' : 'mdi-check'" size="small"></v-icon>
                  </v-btn>
                </v-col>
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
                  <div
                    class="custom-input-box text-center cursor-pointer"
                    :class="{ 'failure-set-bg': isFailureSet(ex, setIndex) }"
                    @click="openScrollPicker(ex, setIndex - 1)"
                  >
                    <span class="text-body-1 font-weight-bold">
                      {{ ex.performed[setIndex - 1].weight !== null && ex.performed[setIndex - 1].weight !== undefined ? ex.performed[setIndex - 1].weight : '0' }}
                    </span>
                    <span class="text-caption text-medium-emphasis ml-1">kg</span>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div
                    class="custom-input-box text-center cursor-pointer"
                    :class="{ 'failure-set-bg': isFailureSet(ex, setIndex) }"
                    @click="openScrollPicker(ex, setIndex - 1)"
                  >
                    <span class="text-body-1 font-weight-bold">
                      {{ ex.performed[setIndex - 1].reps !== null && ex.performed[setIndex - 1].reps !== undefined ? ex.performed[setIndex - 1].reps : '0' }}
                    </span>
                    <span class="text-caption text-medium-emphasis ml-1">reps</span>
                  </div>
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

    <!-- Active Workout Warning Dialog -->
    <v-dialog v-model="activeWorkoutWarningDialog" max-width="400" persistent>
      <v-card color="surface">
        <v-card-title class="text-h6 pt-4 px-4 font-weight-bold text-warning">
          <v-icon icon="mdi-alert" class="mr-2"></v-icon>Treino em Andamento
        </v-card-title>
        <v-card-text class="px-4 text-medium-emphasis">
          Você já possui um treino em andamento. Retornando ao treino ativo...
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="dismissWarningDialog">OK</v-btn>
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

    <!-- Scroll Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="340" persistent>
      <v-card color="white" class="scroll-picker-card rounded-xl pa-4" style="color: #121212 !important;">
        <!-- Header: Centered Exercise Name with Close button absolute on right -->
        <div class="position-relative d-flex justify-center align-center mb-4 pt-1" style="min-height: 48px;">
          <div class="text-subtitle-1 font-weight-bold text-center text-dark-charcoal px-8" style="line-height: 1.3; color: #1C1C1E !important;">
            {{ pickerExercise?.name }} <span class="text-grey-dark font-weight-medium">({{ pickerSetIndex + 1 }}/{{ pickerExercise?.setsMax }})</span>
          </div>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small" 
            color="black" 
            @click="showPicker = false"
            class="position-absolute"
            style="right: -8px; top: -8px;"
          ></v-btn>
        </div>

        <!-- Wheel Picker Container -->
        <div class="wheel-picker-container">
          <!-- Highlight bar/pills background -->
          <div class="wheel-picker-highlight-overlay">
            <div class="highlight-pill weight-pill">
              <span class="pill-label">KG</span>
            </div>
            <div class="highlight-pill reps-pill">
              <span class="pill-label">REPS</span>
            </div>
          </div>

          <!-- Picker Columns -->
          <div class="wheel-picker-columns">
            <!-- Weight columns container (integer + dot + decimal) -->
            <div class="wheel-weight-container" style="width: 150px; display: flex; align-items: center; justify-content: center;">
              <!-- Weight Integer column -->
              <div class="wheel-column weight-int-column" style="width: 65px;">
                <div class="wheel-scroll" ref="weightIntScrollEl" @scroll="handleScroll($event, 'weightInt')">
                  <div class="wheel-padding"></div>
                  <div 
                    v-for="wInt in weightIntOptions" 
                    :key="wInt" 
                    class="wheel-item"
                    :class="{ 'active': selectedWeightInteger === wInt }"
                    @click="scrollToValue('weightInt', wInt)"
                  >
                    {{ wInt }}
                  </div>
                  <div class="wheel-padding"></div>
                </div>
              </div>

              <!-- Separator dot -->
              <div class="wheel-separator">.</div>

              <!-- Weight Decimal column -->
              <div class="wheel-column weight-dec-column" style="width: 45px;">
                <div class="wheel-scroll" ref="weightDecScrollEl" @scroll="handleScroll($event, 'weightDec')">
                  <div class="wheel-padding"></div>
                  <div 
                    v-for="wDec in weightDecOptions" 
                    :key="wDec" 
                    class="wheel-item"
                    :class="{ 'active': selectedWeightDecimal === wDec }"
                    @click="scrollToValue('weightDec', wDec)"
                  >
                    {{ wDec }}
                  </div>
                  <div class="wheel-padding"></div>
                </div>
              </div>
            </div>

            <!-- Reps column -->
            <div class="wheel-column" style="width: 120px;">
              <div class="wheel-scroll" ref="repsScrollEl" @scroll="handleScroll($event, 'reps')">
                <div class="wheel-padding"></div>
                <div 
                  v-for="rep in repsOptions" 
                  :key="rep" 
                  class="wheel-item reps-item"
                  :class="{ 'active': selectedReps === rep }"
                  @click="scrollToValue('reps', rep)"
                >
                  {{ rep }}
                </div>
                <div class="wheel-padding"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-caption font-weight-black text-center mb-4 text-uppercase tracking-wide text-grey-dark" style="font-size: 11px !important;">
          Treinos Personalizados por Objetivo
        </div>

        <!-- Save Button -->
        <v-btn
          block
          color="#00E676"
          height="48"
          rounded="pill"
          class="text-none font-weight-bold text-white finish-picker-btn elevation-0"
          @click="savePickerValue"
          style="background: #00E676 !important; font-size: 15px;"
        >
          SALVAR
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ExerciseGuideDialog from '@/components/ExerciseGuideDialog.vue';
import { groupExercises, parseMachine } from '@/utils/workoutHelpers';

const route = useRoute();
const router = useRouter();
const store = useStore();

const guideDialog = ref(false);
const selectedExerciseForGuide = ref('');

const openGuide = (name) => {
  selectedExerciseForGuide.value = name;
  guideDialog.value = true;
};

const routineId = computed(() => route.params.id);
const routine = computed(() => store.getters['workouts/getRoutineById'](routineId.value));

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

const initWorkout = () => {
  const isActive = store.getters['session/isActive'];
  const activeId = store.getters['session/routineId'];

  if (isActive) {
    if (activeId !== routineId.value) {
      activeIdToRedirect.value = activeId;
      activeWorkoutWarningDialog.value = true;
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
  } else {
    sessionExercises.value = [];
  }
};

onMounted(() => {
  initWorkout();
});

onUnmounted(() => {
  // Limpar os timeouts de scroll ativos para evitar memory leaks
  Object.values(scrollTimeouts).forEach(timeout => {
    if (timeout) clearTimeout(timeout);
  });
});

// Watch for route/id changes to re-run initialization if the component is reused
watch(() => route.params.id, (newId) => {
  if (newId) {
    initWorkout();
  }
});

// Sincroniza qualquer alteração no formulário com o estado global
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
const activeWorkoutWarningDialog = ref(false);
const activeIdToRedirect = ref(null);

const dismissWarningDialog = () => {
  activeWorkoutWarningDialog.value = false;
  if (activeIdToRedirect.value) {
    router.push(`/workout/${activeIdToRedirect.value}`);
  }
};

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
    accumulatedTime: 0,
    startTime: null,
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

  store.dispatch('session/clearSession');

  showMessage('Treino finalizado! +50 XP ganhos!', 'success');
  
  setTimeout(() => {
    router.push('/history');
  }, 1500);
};

// State for Scroll Picker
const showPicker = ref(false);
const pickerExercise = ref(null);
const pickerSetIndex = ref(0);
const selectedReps = ref(10);
const selectedWeightInteger = ref(60);
const selectedWeightDecimal = ref(0);

const repsScrollEl = ref(null);
const weightIntScrollEl = ref(null);
const weightDecScrollEl = ref(null);

const repsOptions = Array.from({ length: 100 }, (_, i) => i + 1);
const weightIntOptions = Array.from({ length: 501 }, (_, i) => i);
const weightDecOptions = Array.from({ length: 10 }, (_, i) => i);

const openScrollPicker = (ex, index) => {
  pickerExercise.value = ex;
  pickerSetIndex.value = index;
  
  const currentSet = ex.performed[index] || { reps: 10, weight: 0 };
  
  selectedReps.value = currentSet.reps || 10;
  const weight = currentSet.weight || 0;
  selectedWeightInteger.value = Math.floor(weight);
  selectedWeightDecimal.value = Math.round((weight - Math.floor(weight)) * 10);
  if (selectedWeightDecimal.value > 9) {
    selectedWeightDecimal.value = 0;
    selectedWeightInteger.value += 1;
  }
  
  showPicker.value = true;
  
  setTimeout(() => {
    syncScrollPositions();
  }, 150);
};

const syncScrollPositions = () => {
  if (repsScrollEl.value) {
    const repsIdx = repsOptions.indexOf(selectedReps.value);
    if (repsIdx !== -1) {
      repsScrollEl.value.scrollTop = repsIdx * 40;
    }
  }
  if (weightIntScrollEl.value) {
    const intIdx = weightIntOptions.indexOf(selectedWeightInteger.value);
    if (intIdx !== -1) {
      weightIntScrollEl.value.scrollTop = intIdx * 40;
    }
  }
  if (weightDecScrollEl.value) {
    const decIdx = weightDecOptions.indexOf(selectedWeightDecimal.value);
    if (decIdx !== -1) {
      weightDecScrollEl.value.scrollTop = decIdx * 40;
    }
  }
};

const scrollTimeouts = {
  reps: null,
  weightInt: null,
  weightDec: null
};

const handleScroll = (event, type) => {
  const el = event.target;
  
  if (scrollTimeouts[type]) {
    clearTimeout(scrollTimeouts[type]);
  }
  
  scrollTimeouts[type] = setTimeout(() => {
    const scrollTop = el.scrollTop;
    const index = Math.round(scrollTop / 40);
    
    if (type === 'reps') {
      const val = repsOptions[index];
      if (val !== undefined && val !== selectedReps.value) {
        selectedReps.value = val;
      }
    } else if (type === 'weightInt') {
      const val = weightIntOptions[index];
      if (val !== undefined && val !== selectedWeightInteger.value) {
        selectedWeightInteger.value = val;
      }
    } else if (type === 'weightDec') {
      const val = weightDecOptions[index];
      if (val !== undefined && val !== selectedWeightDecimal.value) {
        selectedWeightDecimal.value = val;
      }
    }
  }, 60);
};

const scrollToValue = (type, value) => {
  if (type === 'reps') {
    selectedReps.value = value;
    const idx = repsOptions.indexOf(value);
    if (idx !== -1 && repsScrollEl.value) {
      repsScrollEl.value.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  } else if (type === 'weightInt') {
    selectedWeightInteger.value = value;
    const idx = weightIntOptions.indexOf(value);
    if (idx !== -1 && weightIntScrollEl.value) {
      weightIntScrollEl.value.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  } else if (type === 'weightDec') {
    selectedWeightDecimal.value = value;
    const idx = weightDecOptions.indexOf(value);
    if (idx !== -1 && weightDecScrollEl.value) {
      weightDecScrollEl.value.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  }
};

const savePickerValue = () => {
  if (pickerExercise.value && pickerSetIndex.value !== null) {
    const newWeight = parseFloat(`${selectedWeightInteger.value}.${selectedWeightDecimal.value}`);
    const newReps = selectedReps.value;
    
    const set = pickerExercise.value.performed[pickerSetIndex.value];
    if (set) {
      set.weight = newWeight;
      set.reps = newReps;
      set.completed = true;
    }
  }
  showPicker.value = false;
};

const allSetsCompleted = (ex) => {
  return ex.performed && ex.performed.every(s => s.completed);
};

const toggleAllSets = (ex) => {
  if (!ex.performed) return;
  const targetState = !allSetsCompleted(ex);
  ex.performed.forEach(s => {
    s.completed = targetState;
  });
};
</script>

<style scoped>
.custom-input-box {
  background: #1E1E1E;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  height: 40px;
  line-height: 38px;
  transition: border-color 0.15s ease, background 0.15s ease;
  user-select: none;
}
.custom-input-box:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(255, 255, 255, 0.02);
}
.custom-input-box:active {
  background: rgba(255, 255, 255, 0.05);
}
.failure-set-bg {
  background: rgba(255, 109, 0, 0.1) !important;
  border-color: rgba(255, 109, 0, 0.3) !important;
}

/* Scroll Picker styling */
.scroll-picker-card {
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3) !important;
  font-family: inherit;
}
.text-dark-charcoal {
  color: #1C1C1E !important;
}
.text-grey-dark {
  color: #8E8E93 !important;
}
.wheel-picker-container {
  position: relative;
  height: 200px;
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.wheel-picker-highlight-overlay {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  height: 40px;
  pointer-events: none;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0 12px;
}
.highlight-pill {
  height: 40px;
  background-color: #F2F2F7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
}
.reps-pill {
  width: 120px;
}
.weight-pill {
  width: 150px;
}
.pill-label {
  font-size: 11px;
  font-weight: 800;
  color: #8E8E93;
  letter-spacing: 0.5px;
}
.wheel-picker-columns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  z-index: 1;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
}
.wheel-weight-container {
  height: 100%;
  position: relative;
}
.wheel-column {
  height: 100%;
  position: relative;
}
.wheel-scroll {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.wheel-scroll::-webkit-scrollbar {
  display: none;
}
.wheel-padding {
  height: 80px;
}
.wheel-item {
  height: 40px;
  line-height: 40px;
  text-align: center;
  scroll-snap-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #C7C7CC;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.wheel-item.active {
  font-size: 24px;
  font-weight: 800;
  color: #1C1C1E;
}
.reps-item {
  text-align: left;
  padding-left: 24px;
}
.weight-int-column .wheel-item {
  text-align: right;
  padding-right: 4px;
}
.weight-dec-column .wheel-item {
  text-align: left;
  padding-left: 4px;
}
.wheel-separator {
  font-size: 22px;
  font-weight: 800;
  color: #1C1C1E;
  height: 40px;
  line-height: 34px;
  user-select: none;
  pointer-events: none;
  width: 12px;
  text-align: center;
}
</style>
