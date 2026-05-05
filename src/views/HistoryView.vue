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
              <div v-for="ex in session.exercises" :key="ex.id" class="mb-1 text-body-2">
                <strong>{{ ex.name }}</strong>: 
                {{ ex.performed.filter(s => s.completed).length }}/{{ ex.sets }} séries completas
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
</script>
