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
          v-for="(ex, index) in sessionExercises"
          :key="ex.id"
          class="mb-2 bg-surface"
        >
          <v-expansion-panel-title>
            <div>
              <div class="font-weight-bold">{{ index + 1 }}. {{ ex.name }}</div>
              <div class="text-caption text-medium-emphasis" v-if="ex.machine">
                <v-icon icon="mdi-tools" size="x-small" class="mr-1"></v-icon>{{ ex.machine }}
              </div>
              <div class="text-caption mt-1">
                <v-chip v-if="ex.failureSets > 0 && ex.failureSets === ex.setsMax" size="x-small" color="secondary" class="mr-1">Todas até a Falha</v-chip>
                <template v-else>
                  <span class="text-primary font-weight-medium">{{ ex.repsMin }}–{{ ex.repsMax }} reps</span>
                  <v-chip v-if="ex.failureSets > 0" size="x-small" color="secondary" class="ml-1">
                    Últim{{ ex.failureSets > 1 ? `as ${ex.failureSets}` : 'a' }} até a falha
                  </v-chip>
                </template>
              </div>
            </div>
            <v-spacer></v-spacer>
            <v-chip size="small" :color="isExerciseComplete(ex) ? 'success' : 'default'" class="mr-2">
              {{ completedSetsCount(ex) }}/{{ ex.setsMax }}
            </v-chip>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
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
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-btn
        color="primary"
        size="large"
        block
        rounded="pill"
        class="mt-6"
        @click="finishWorkout"
      >
        Finalizar Treino
      </v-btn>
    </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();

const routineId = route.params.id;
const routine = computed(() => store.getters['workouts/getRoutineById'](routineId));

// State for the ongoing session
const sessionExercises = ref([]);
const activePanel = ref([0]); // Open first exercise by default

const elapsedTime = computed(() => store.getters['session/elapsedTime']);

const formattedTime = computed(() => {
  const mins = Math.floor((elapsedTime.value || 0) / 60);
  const secs = (elapsedTime.value || 0) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  }
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
  const sessionData = {
    routineId:    routine.value.id,
    routineName:  routine.value.name,
    date:         new Date().toISOString(),
    duration:     elapsedTime.value,
    exercises:    sessionExercises.value
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
</script>
