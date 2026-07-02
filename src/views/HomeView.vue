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
        <v-card 
          color="surface" 
          elevation="3" 
          rounded="xl" 
          class="pa-5 last-session-card position-relative overflow-hidden"
          @click="goToHistory"
        >
          <!-- Background sutil decorativo -->
          <div class="card-gradient-bg"></div>

          <div class="d-flex align-center justify-space-between mb-3 position-relative" style="z-index: 1;">
            <div class="d-flex align-center">
              <v-chip size="x-small" color="secondary" variant="flat" class="font-weight-black text-uppercase tracking-wider px-2">
                Último Treino
              </v-chip>
              <span class="text-caption text-medium-emphasis ml-2 font-weight-bold">
                {{ formatSessionDate(lastSession.date) }}
              </span>
            </div>
            <v-icon icon="mdi-check-decagram" color="success" size="small"></v-icon>
          </div>

          <h3 class="text-h6 font-weight-black mb-3 text-high-emphasis position-relative" style="z-index: 1;">
            {{ lastSession.routineName }}
          </h3>

          <div class="d-flex align-center flex-wrap gap-4 position-relative" style="gap: 16px; z-index: 1;">
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-clock-outline" size="small" color="primary" class="mr-1"></v-icon>
              <span class="font-weight-medium text-high-emphasis">{{ formatDuration(lastSession.duration) }}</span>
            </div>
            
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-dumbbell" size="small" color="secondary" class="mr-1"></v-icon>
              <span class="font-weight-medium text-high-emphasis">{{ lastSessionExerciseCount }} Exercícios</span>
            </div>

            <v-spacer class="hidden-xs-only"></v-spacer>

            <div class="d-flex align-center text-caption text-primary font-weight-bold ml-auto cursor-pointer">
              Ver histórico
              <v-icon icon="mdi-chevron-right" size="small" class="ml-0.5"></v-icon>
            </div>
          </div>
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

const routines = computed(() => {
  const all = [...store.getters['workouts/allRoutines']];
  return all.sort((a, b) => {
    const daysA = a.daysOfWeek || [];
    const daysB = b.daysOfWeek || [];
    
    // Rotinas sem dias definidos vão para o final
    if (daysA.length === 0 && daysB.length === 0) {
      return a.name.localeCompare(b.name);
    }
    if (daysA.length === 0) return 1;
    if (daysB.length === 0) return -1;
    
    // Mapear dias considerando Domingo (0) como o último dia da semana de treino (valor 7)
    const mappedA = daysA.map(d => d === 0 ? 7 : d).sort((x, y) => x - y);
    const mappedB = daysB.map(d => d === 0 ? 7 : d).sort((x, y) => x - y);
    
    const minA = mappedA[0];
    const minB = mappedB[0];
    
    if (minA !== minB) {
      return minA - minB;
    }
    
    // Desempate pelos demais dias de treino da rotina
    const maxLength = Math.max(mappedA.length, mappedB.length);
    for (let i = 1; i < maxLength; i++) {
      const valA = mappedA[i] !== undefined ? mappedA[i] : -1;
      const valB = mappedB[i] !== undefined ? mappedB[i] : -1;
      if (valA !== valB) {
        return valA - valB;
      }
    }
    
    return a.name.localeCompare(b.name);
  });
});
const history = computed(() => store.getters['history/allSessions']);
const lastSession = computed(() => store.getters['history/lastSession']);

const lastSessionExerciseCount = computed(() => {
  if (!lastSession.value || !lastSession.value.exercises) return 0;
  return lastSession.value.exercises.filter(ex => !ex.isNotes).length;
});

const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

const formatSessionDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) => 
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) {
    return 'Hoje';
  } else if (isSameDay(date, yesterday)) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
};

const goToHistory = () => {
  router.push('/history');
};

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



const getScheduledDaysOfWeek = computed(() => {
  const scheduled = new Set();
  routines.value.forEach(r => {
    if (r.daysOfWeek && Array.isArray(r.daysOfWeek)) {
      r.daysOfWeek.forEach(d => scheduled.add(d));
    }
  });
  return scheduled;
});

// Streak de dias seguidos treinando (respeitando dias de descanso)
const currentStreak = computed(() => {
  if (history.value.length === 0) return 0;
  
  const sessionDateSet = new Set(history.value.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }));
  
  const scheduledDays = getScheduledDaysOfWeek.value;
  const hasSchedule = scheduledDays.size > 0;
  
  let streak = 0;
  const today = new Date();
  let hasTrainedInStreak = false;
  
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday...
    
    const trained = sessionDateSet.has(key);
    
    if (trained) {
      streak += 1;
      hasTrainedInStreak = true;
    } else {
      if (i === 0) {
        // Se hoje for dia de descanso ou treino e ainda não treinou, não quebra a sequência (dia não acabou)
        continue;
      }
      
      const isRestDay = hasSchedule && !scheduledDays.has(dayOfWeek);
      if (isRestDay) {
        // Dia de descanso: apenas pula sem quebrar a sequência e sem somar ao streak
        continue;
      } else {
        // Dia de treino obrigatório que o usuário perdeu: quebra o streak!
        break;
      }
    }
  }
  
  if (!hasTrainedInStreak) return 0;
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
.last-session-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  cursor: pointer;
}
.last-session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 230, 118, 0.06) !important;
  border-color: rgba(0, 230, 118, 0.2) !important;
}
.card-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 230, 118, 0.03) 0%, rgba(0, 176, 255, 0.03) 100%);
  pointer-events: none;
  z-index: 0;
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
