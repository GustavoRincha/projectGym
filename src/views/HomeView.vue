<template>
  <div class="home-view">
    <v-row class="mt-4">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold mb-2">Pronto para treinar?</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Vamos atingir suas metas hoje.</p>
      </v-col>
    </v-row>

    <!-- Workout Suggestion Section -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border border-primary">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-h6 font-weight-bold text-primary">
              <v-icon icon="mdi-calendar-star" class="mr-1"></v-icon> Treino do Dia
            </span>
          </div>
          
          <div v-if="suggestedRoutine">
            <h2 class="text-h5 mb-2">{{ suggestedRoutine.name }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ suggestedRoutine.exercises.length }} exercícios programados
            </p>
            <v-btn color="primary" block size="large" rounded="pill" @click="startWorkout(suggestedRoutine.id)">
              Iniciar Treino
            </v-btn>
          </div>
          <div v-else>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Nenhum treino cadastrado ainda.
            </p>
            <v-btn color="primary" block size="large" rounded="pill" to="/workouts">
              Criar Meu Primeiro Treino
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Manual Selection Section -->
    <v-row class="mt-4" v-if="routines.length > 0">
      <v-col cols="12">
        <h3 class="text-h6 font-weight-bold mb-3">Ou escolha outro treino:</h3>
        <v-row>
          <v-col cols="6" sm="4" v-for="routine in routines" :key="routine.id">
            <v-card color="surface" elevation="1" rounded="lg" @click="startWorkout(routine.id)" class="text-center pa-4 h-100 d-flex flex-column justify-center align-center hover-card">
              <span class="text-subtitle-1 font-weight-bold">{{ routine.name }}</span>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    
    <v-row class="mt-6" v-if="lastSession">
      <v-col cols="12">
        <v-card color="surface" elevation="1" rounded="lg" class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2 text-secondary">
            <v-icon icon="mdi-history" class="mr-1"></v-icon> Último Treino
          </h3>
          <p class="mb-0 text-body-2">
            {{ lastSession.routineName }} - {{ new Date(lastSession.date).toLocaleDateString() }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const routines = computed(() => store.getters['workouts/allRoutines']);
const history = computed(() => store.getters['history/allSessions']);
const lastSession = computed(() => store.getters['history/lastSession']);

// Smart logic to suggest the next workout based on daysOfWeek or history
const suggestedRoutine = computed(() => {
  if (routines.value.length === 0) return null;

  // 1. Try to find a workout scheduled for TODAY
  const today = new Date().getDay(); // 0 = Dom, 1 = Seg...
  const todayRoutines = routines.value.filter(r => r.daysOfWeek && r.daysOfWeek.includes(today));
  
  if (todayRoutines.length > 0) {
    // Ideally we would check if it was already completed today, but for now return the first one scheduled
    return todayRoutines[0];
  }

  // 2. Fallback: if no workout is scheduled for today, use the history logic
  if (!lastSession.value) return routines.value[0]; // If no history, suggest the first one

  // Find index of last routine in our current routines
  const lastIndex = routines.value.findIndex(r => r.id === lastSession.value.routineId);
  
  if (lastIndex === -1 || lastIndex === routines.value.length - 1) {
    // If not found or was the last one, loop back to the first
    return routines.value[0];
  }
  
  // Suggest the next one in the list
  return routines.value[lastIndex + 1];
});

const startWorkout = (id) => {
  router.push(`/workout/${id}`);
};
</script>

<style scoped>
.hover-card {
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
}
.hover-card:hover {
  border-color: #00E676;
  background-color: #2c2c2c !important;
}
</style>
