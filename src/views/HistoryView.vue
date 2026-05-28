<template>
  <div class="history-view pb-16">
    <h1 class="text-h4 font-weight-bold mb-6 mt-4">Histórico</h1>

    <div v-if="sessions.length > 0">
      <!-- Filtros de Período -->
      <div class="d-flex justify-center mb-6">
        <v-btn-toggle
          v-model="selectedPeriod"
          mandatory
          color="primary"
          variant="tonal"
          rounded="pill"
          density="compact"
        >
          <v-btn value="week" class="text-caption font-weight-bold">Esta Semana</v-btn>
          <v-btn value="month" class="text-caption font-weight-bold">Este Mês</v-btn>
          <!-- <v-btn value="30days" class="text-caption font-weight-bold">Últimos 30d</v-btn> -->
          <v-btn value="all" class="text-caption font-weight-bold">Todos</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Exibição dos Treinos Filtrados -->
      <div v-if="filteredSessions.length > 0">
        <v-timeline side="end" align="start" truncate-line="both">
          <v-timeline-item
            v-for="session in filteredSessions"
            :key="session.id"
            dot-color="primary"
            size="small"
            icon="mdi-dumbbell"
          >
            <v-card color="surface" elevation="2" rounded="xl" class="mb-4 overflow-hidden border border-light-trans">
              <!-- Cabeçalho do Card (Sempre visível, clicável para expandir) -->
              <div @click="toggleSession(session.id)" class="session-header pa-4">
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <span class="text-caption text-medium-emphasis font-weight-bold d-block mb-1">
                      <v-icon icon="mdi-calendar-outline" size="x-small" class="mr-1"></v-icon>
                      {{ formatDate(session.date) }}
                    </span>
                    <h3 class="text-subtitle-1 font-weight-black text-high-emphasis leading-tight mb-2">
                      {{ session.routineName }}
                    </h3>
                  </div>
                  <v-btn
                    icon="mdi-chevron-down"
                    variant="text"
                    size="small"
                    color="medium-emphasis"
                    :class="['chevron-icon', { 'expanded': expanded[session.id] }]"
                    @click.stop="toggleSession(session.id)"
                  ></v-btn>
                </div>

                <!-- Quick stats chips -->
                <div class="d-flex flex-wrap gap-2 mt-1" style="gap: 8px;">
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                    <v-icon icon="mdi-clock-outline" size="x-small" class="mr-1"></v-icon>
                    {{ formatDuration(session.duration) }}
                  </v-chip>
                  
                  <v-chip size="x-small" color="secondary" variant="tonal" class="font-weight-bold">
                    <v-icon icon="mdi-dumbbell" size="x-small" class="mr-1"></v-icon>
                    {{ getSessionExercises(session).length }} Exs
                  </v-chip>

                  <v-chip 
                    v-if="getSessionCardios(session).length > 0" 
                    size="x-small" 
                    color="success" 
                    variant="tonal" 
                    class="font-weight-bold"
                  >
                    <v-icon icon="mdi-heart-pulse" size="x-small" class="mr-1"></v-icon>
                    Cardio
                  </v-chip>

                  <v-chip 
                    v-if="getSessionNotes(session)" 
                    size="x-small" 
                    color="info" 
                    variant="tonal" 
                    class="font-weight-bold"
                  >
                    <v-icon icon="mdi-note-text-outline" size="x-small" class="mr-1"></v-icon>
                    Obs
                  </v-chip>
                </div>
              </div>

              <!-- Detalhes do Treino (Expandido) -->
              <v-expand-transition>
                <div v-show="expanded[session.id] || false">
                  <v-divider></v-divider>
                  <div class="pa-4 pt-3">
                    <!-- Título da seção -->
                    <h4 class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis mb-3">
                      Exercícios e Séries
                    </h4>

                    <!-- Lista de Exercícios -->
                    <div class="d-flex flex-column" style="gap: 12px;">
                      <div 
                        v-for="ex in getSessionExercises(session)" 
                        :key="ex.id" 
                        class="exercise-row"
                      >
                        <div class="d-flex justify-space-between align-start">
                          <div>
                            <span class="text-body-2 font-weight-bold text-high-emphasis d-block">{{ ex.name }}</span>
                            <span class="text-caption text-medium-emphasis" v-if="ex.machine">
                              Equipamento: {{ ex.machine }}
                            </span>
                          </div>
                          <v-chip size="x-small" color="primary" variant="outlined" class="font-weight-black">
                            {{ getCompletedSetsCount(ex) }}/{{ ex.setsMax || ex.sets || (ex.performed ? ex.performed.length : 0) }} séries
                          </v-chip>
                        </div>
                        
                        <!-- Detalhes de carga e repetições das séries -->
                        <div class="d-flex flex-wrap mt-1.5 pl-1" style="gap: 6px;" v-if="ex.performed && ex.performed.length">
                          <v-chip 
                            v-for="(set, sIdx) in ex.performed" 
                            :key="sIdx" 
                            size="x-small" 
                            :color="set.completed ? 'success' : 'surface-variant'" 
                            variant="tonal"
                            class="font-weight-medium"
                          >
                            S{{ sIdx + 1 }}: {{ set.weight || 0 }}kg x {{ set.reps || 0 }}
                          </v-chip>
                        </div>

                        <!-- Notas do Exercício -->
                        <div v-if="ex.notes" class="exercise-note mt-2 text-caption text-medium-emphasis pl-3">
                          <v-icon icon="mdi-note-text-outline" size="x-small" class="mr-1"></v-icon>
                          {{ ex.notes }}
                        </div>
                      </div>
                    </div>

                    <!-- Seção de Cardio -->
                    <div v-if="getSessionCardios(session).length > 0" class="mt-4 pt-3 border-t">
                      <h4 class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis mb-3">
                        Cardio Realizado
                      </h4>
                      <div class="d-flex flex-wrap gap-2" style="gap: 8px;">
                        <v-chip
                          v-for="cardio in getSessionCardios(session)"
                          :key="cardio.id"
                          size="small"
                          variant="outlined"
                          color="secondary"
                          class="font-weight-bold"
                        >
                          <v-icon :icon="getCardioIcon(cardio.name)" size="x-small" class="mr-2 text-secondary"></v-icon>
                          {{ cardio.name }}: {{ cardio.duration }} min
                          <span v-if="cardio.distance" class="ml-1">• {{ cardio.distance }} km</span>
                        </v-chip>
                      </div>
                    </div>

                    <!-- Observações Gerais do Treino -->
                    <div v-if="getSessionNotes(session)" class="mt-4 pt-3 border-t">
                      <h4 class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis mb-2">
                        Observações do Treino
                      </h4>
                      <div class="notes-box pa-3 rounded-lg text-body-2 text-medium-emphasis">
                        {{ getSessionNotes(session) }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </div>

      <!-- Estado Vazio quando Filtrado -->
      <div v-else class="text-center py-12">
        <v-icon icon="mdi-calendar-remove" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h3 class="text-h6 text-medium-emphasis font-weight-medium">Nenhum treino concluído no período selecionado.</h3>
      </div>
    </div>

    <!-- Estado Vazio Geral -->
    <v-row v-else class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-history" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h2 class="text-h6 text-medium-emphasis">Você ainda não finalizou nenhum treino.</h2>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const sessions = computed(() => store.getters['history/allSessions']);

// Controle de Expansão dos Cards
const expanded = ref({});
const selectedPeriod = ref('week');

const toggleSession = (id) => {
  expanded.value[id] = !expanded.value[id];
};

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const filteredSessions = computed(() => {
  const allSessions = sortedSessions.value;
  if (selectedPeriod.value === 'all') {
    return allSessions;
  }

  const now = new Date();
  
  if (selectedPeriod.value === 'week') {
    // Segunda-feira da semana atual
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    
    return allSessions.filter(s => new Date(s.date) >= monday);
  }

  if (selectedPeriod.value === 'month') {
    // Primeiro dia do mês atual
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    return allSessions.filter(s => new Date(s.date) >= firstDayOfMonth);
  }

  if (selectedPeriod.value === '30days') {
    // Últimos 30 dias
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    return allSessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
  }

  return allSessions;
});

const formatDate = (isoString) => {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
  const formatted = new Date(isoString).toLocaleDateString('pt-BR', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

const getSessionExercises = (session) => {
  return (session.exercises || []).filter(e => !e.isNotes && !e.isCardio);
};

const getCompletedSetsCount = (ex) => {
  return (ex.performed || []).filter(s => s.completed).length;
};

const getSessionNotes = (session) => {
  const notesObj = (session.exercises || []).find(e => e.isNotes);
  return notesObj ? notesObj.notes : '';
};

const getSessionCardios = (session) => {
  return (session.exercises || []).filter(e => e.isCardio);
};

const getCardioIcon = (name) => {
  if (!name || typeof name !== 'string') return 'mdi-heart-pulse';
  const n = name.toLowerCase();
  if (n.includes('esteira') || n.includes('corrida') || n.includes('caminhada')) return 'mdi-run';
  if (n.includes('bicicleta') || n.includes('bike')) return 'mdi-bike';
  if (n.includes('elíptico')) return 'mdi-walk';
  if (n.includes('escada')) return 'mdi-stairs';
  if (n.includes('corda')) return 'mdi-jump-rope';
  return 'mdi-heart-pulse';
};
</script>

<style scoped>
.session-header {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.session-header:hover {
  background-color: rgba(255, 255, 255, 0.02);
}
.border-light-trans {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.chevron-icon {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.chevron-icon.expanded {
  transform: rotate(180deg);
}
.border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.notes-box {
  background-color: rgba(255, 255, 255, 0.02);
  border-left: 3px solid rgb(var(--v-theme-primary));
  font-style: italic;
}
.exercise-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 10px;
}
.exercise-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.exercise-note {
  border-left: 2px solid rgba(var(--v-theme-primary), 0.3);
  font-style: italic;
}
.v-btn-toggle .v-btn {
  padding: 0 10px !important;
  min-width: unset !important;
}
</style>
