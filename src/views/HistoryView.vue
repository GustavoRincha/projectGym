<template>
  <div class="history-view">
    <h1 class="text-h4 font-weight-bold mb-6 mt-4">Histórico</h1>

    <div v-if="sessions.length > 0">
      <v-timeline side="end" align="start">
        <v-timeline-item
          v-for="session in sortedSessions"
          :key="session.id"
          dot-color="primary"
          size="small"
        >
          <v-card color="surface" elevation="1" rounded="lg" class="mb-4">
            <v-card-item>
              <template v-slot:title>
                <span class="text-subtitle-1 font-weight-bold">{{ session.routineName }}</span>
              </template>
              <template v-slot:subtitle>
                {{ formatDate(session.date) }} - {{ formatDuration(session.duration) }}
              </template>
            </v-card-item>
            <v-card-text>
              <div v-for="ex in (session.exercises || []).filter(e => !e.isNotes && !e.isCardio)" :key="ex.id" class="mb-2 text-body-2">
                <div>
                  <strong>{{ ex.name }}</strong>: 
                  {{ (ex.performed || []).filter(s => s.completed).length }}/{{ ex.setsMax || ex.sets || (ex.performed ? ex.performed.length : 0) }} séries completas
                </div>
                <div v-if="ex.notes" class="text-caption text-medium-emphasis pl-3 mt-1 text-italic" style="border-left: 2px solid rgba(var(--v-theme-primary), 0.5); font-style: italic;">
                  <v-icon icon="mdi-note-text-outline" size="x-small" class="mr-1"></v-icon>
                  {{ ex.notes }}
                </div>
              </div>

              <!-- Cardio Realizado -->
              <div v-if="getSessionCardios(session).length > 0" class="mt-3 pt-2 text-body-2" style="border-top: 1px solid rgba(255, 255, 255, 0.12);">
                <div class="font-weight-bold mb-1 text-secondary">
                  <v-icon icon="mdi-heart-pulse" size="small" class="mr-1"></v-icon>
                  Cardio Realizado:
                </div>
                <div v-for="cardio in getSessionCardios(session)" :key="cardio.id" class="pl-3 d-flex align-center text-caption text-medium-emphasis mb-1">
                  <v-icon :icon="getCardioIcon(cardio.name)" size="x-small" class="mr-2 text-secondary"></v-icon>
                  <span>{{ cardio.name }} - {{ cardio.duration }} min <span v-if="cardio.distance">/ {{ cardio.distance }} km</span></span>
                </div>
              </div>

              <!-- Observações Gerais do Treino -->
              <div v-if="getSessionNotes(session)" class="mt-3 pt-2 text-body-2 text-medium-emphasis" style="border-top: 1px solid rgba(255, 255, 255, 0.12);">
                <v-icon icon="mdi-note-text" size="small" class="mr-1 text-primary"></v-icon>
                <strong>Observações:</strong> {{ getSessionNotes(session) }}
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </div>

    <v-row v-else class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-history" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h2 class="text-h6 text-medium-emphasis">Você ainda não finalizou nenhum treino.</h2>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const sessions = computed(() => store.getters['history/allSessions']);

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const formatDate = (isoString) => {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
  return new Date(isoString).toLocaleDateString('pt-BR', options);
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
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
  if (name.includes('Esteira') || name.includes('Corrida') || name.includes('Caminhada')) return 'mdi-run';
  if (name.includes('Bicicleta') || name.includes('Bike')) return 'mdi-bike';
  if (name.includes('Elíptico')) return 'mdi-walk';
  if (name.includes('Escada')) return 'mdi-stairs';
  if (name.includes('Corda')) return 'mdi-jump-rope';
  return 'mdi-heart-pulse';
};
</script>
