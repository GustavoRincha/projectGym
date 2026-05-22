<template>
  <div class="home-view">
    <v-row class="mt-4">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold mb-2">Pronto para treinar?</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Vamos atingir suas metas hoje.</p>
      </v-col>
    </v-row>

    <!-- Frequência de Treinos Minimalista -->
    <v-row class="mt-0 mb-6 justify-center">
      <div class="d-flex align-center" style="gap: 6px;">
        <div 
          v-for="(day, idx) in weekDays" 
          :key="idx"
          :class="[
            'week-day-circle',
            day.hasTrained ? 'trained' : '',
            day.isToday ? 'today' : ''
          ]"
          :title="day.label"
        >
          {{ day.char }}
        </div>
        
        <v-chip
          v-if="currentStreak > 0"
          size="small"
          color="secondary"
          variant="flat"
          class="ml-2 font-weight-bold"
          style="height: 26px; padding: 0 8px;"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-fire" size="small" class="mr-0.5"></v-icon>
          </template>
          {{ currentStreak }}d
        </v-chip>
      </div>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card color="surface" elevation="2" rounded="xl" class="pa-5 border border-primary">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-h6 font-weight-bold text-primary d-flex align-center">
              <v-icon icon="mdi-calendar-star" class="mr-2"></v-icon> Treino do Dia
            </span>
          </div>
          
          <div v-if="suggestedRoutine">
            <h2 class="text-h5 font-weight-bold mb-1">{{ suggestedRoutine.name }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ suggestedRoutine.exercises?.length || 0 }} exercícios programados
            </p>
            <v-btn color="primary" block size="large" rounded="pill" @click="startWorkout(suggestedRoutine.id)">
              Iniciar Treino
            </v-btn>
          </div>
          <div v-else class="text-center py-2">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Nenhum treino cadastrado para hoje.
            </p>
            <v-btn color="primary" block size="large" rounded="pill" to="/workouts">
              Criar ou Agendar Treino
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6" v-if="routines.length > 0">
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold mb-3 text-medium-emphasis">Ou escolha outro da sua rotina:</h3>
        <v-row dense>
          <v-col cols="12" sm="6" md="4" v-for="routine in routines" :key="routine.id">
            <v-card 
              color="surface" 
              elevation="1" 
              rounded="lg" 
              @click="startWorkout(routine.id)" 
              class="text-left pa-4 h-100 d-flex align-center justify-between hover-card"
            >
              <div class="flex-grow-1">
                <span class="text-body-1 font-weight-bold d-block">{{ routine.name }}</span>
                <span class="text-caption text-medium-emphasis">{{ routine.exercises?.length || 0 }} exs</span>
              </div>
              <v-icon icon="mdi-chevron-right" color="medium-emphasis"></v-icon>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    
    <v-row class="mt-6" v-if="lastSession">
      <v-col cols="12">
        <v-card color="surface" variant="outlined" rounded="lg" class="pa-4 border-dashed">
          <h3 class="text-subtitle-2 font-weight-bold mb-2 text-secondary d-flex align-center">
            <v-icon icon="mdi-history" class="mr-2" size="small"></v-icon> ÚLTIMO TREINO CONCLUÍDO
          </h3>
          <p class="mb-0 text-body-2 font-weight-medium">
            {{ lastSession.routineName }} 
            <span class="text-medium-emphasis font-weight-regular ">
              • {{ new Date(lastSession.date).toLocaleDateString('pt-BR') }}
            </span>
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

// Calcula os dias da semana atual (Segunda a Domingo) e verifica se o usuário treinou neles
const weekDays = computed(() => {
  const list = [];
  const today = new Date();
  
  // Obtém a Segunda-feira da semana atual
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const dayChars = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  // Conjunto de datas treinadas no formato YYYY-MM-DD
  const trainedDates = new Set(
    history.value.map(session => {
      const d = new Date(session.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    
    const key = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
    const hasTrained = trainedDates.has(key);
    
    const isToday = 
      currentDay.getDate() === today.getDate() && 
      currentDay.getMonth() === today.getMonth() && 
      currentDay.getFullYear() === today.getFullYear();

    list.push({
      label: dayLabels[i],
      char: dayChars[i],
      hasTrained,
      isToday
    });
  }

  return list;
});

// Contagem de treinos na semana atual
const weeklyFrequencyCount = computed(() => {
  return weekDays.value.filter(d => d.hasTrained).length;
});

// Contagem de treinos no mês atual
const monthlyFrequencyCount = computed(() => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  return history.value.filter(session => {
    const d = new Date(session.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;
});

// Streak de dias seguidos treinando (contando até hoje ou ontem)
const currentStreak = computed(() => {
  if (history.value.length === 0) return 0;
  
  const trainedDates = Array.from(new Set(
    history.value.map(session => {
      const d = new Date(session.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  )).sort((a, b) => new Date(b) - new Date(a));

  if (trainedDates.length === 0) return 0;

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (!trainedDates.includes(todayKey) && !trainedDates.includes(yesterdayKey)) {
    return 0;
  }

  let streak = 0;
  let checkDate = trainedDates.includes(todayKey) ? today : yesterday;

  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (trainedDates.includes(key)) {
      streak++;
      checkDate = new Date(checkDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
});

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
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
.hover-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
}
.border-dashed {
  border-style: dashed !important;
  border-width: 1px;
}
.week-day-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}
.week-day-circle.trained {
  background-color: rgba(0, 230, 118, 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-color: rgba(0, 230, 118, 0.4) !important;
  font-weight: 700;
}
.week-day-circle.today {
  border-color: rgb(var(--v-theme-secondary)) !important;
  border-width: 1.5px;
}
.week-day-circle.trained.today {
  background-color: rgba(0, 230, 118, 0.18) !important;
  border-color: rgb(var(--v-theme-secondary)) !important;
}
</style>
