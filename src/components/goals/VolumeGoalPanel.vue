<template>
  <div class="volume-panel pb-16">
    <h3 class="text-h6 font-weight-bold mb-4">Meta de Volume Total</h3>

    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4">
      <v-row dense align="center" class="mb-4">
        <v-col>
          <v-text-field
            v-model.number="editTarget"
            label="Meta de Volume (kg)"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="auto" style="min-width: 130px">
          <v-select
            v-model="editPeriod"
            :items="periodOptions"
            item-title="label"
            item-value="value"
            label="Período"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" height="40" min-width="56" @click="saveGoal">OK</v-btn>
        </v-col>
      </v-row>

      <div class="d-flex justify-space-between mb-1">
        <span class="text-body-2 font-weight-bold">
          {{ formatVolume(currentVolume) }} de {{ formatVolume(volumeGoal.target) }}
        </span>
        <span class="text-caption" :class="progress >= 100 ? 'text-success' : 'text-primary'">{{ progress }}%</span>
      </div>
      <v-progress-linear :model-value="progress" :color="progress >= 100 ? 'success' : 'primary'" bg-color="background" rounded height="14"></v-progress-linear>

      <div v-if="progress >= 100" class="text-center mt-3 text-success font-weight-bold">🎉 Meta de Volume Atingida!</div>
      <div v-else class="text-caption text-medium-emphasis mt-2 text-right">
        Faltam {{ formatVolume(volumeGoal.target - currentVolume) }} para a meta {{ periodLabel }}
      </div>
    </v-card>

    <!-- Breakdown by session -->
    <h4 class="text-subtitle-2 text-medium-emphasis mb-2">Detalhamento por Sessão ({{ periodLabel }})</h4>
    <div v-if="periodSessions.length === 0" class="text-center py-4 text-medium-emphasis">
      Nenhum treino neste período.
    </div>
    <v-card v-for="s in periodSessions" :key="s.id" color="surface" elevation="1" rounded="lg" class="mb-2 pa-3">
      <div class="d-flex justify-space-between">
        <span class="text-body-2 font-weight-bold">{{ s.routineName }}</span>
        <span class="text-body-2 text-primary font-weight-bold">{{ formatVolume(sessionVolume(s)) }}</span>
      </div>
      <div class="text-caption text-medium-emphasis">{{ formatDate(s.date) }}</div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const volumeGoal = computed(() => store.getters['goals/volumeGoal']);
const sessions   = computed(() => store.getters['history/allSessions']);

const editTarget = ref(volumeGoal.value.target);
const editPeriod = ref(volumeGoal.value.period);

const periodOptions = [
  { label: 'Esta semana', value: 'weekly'  },
  { label: 'Este mês',   value: 'monthly' },
];

const periodLabel = computed(() => periodOptions.find(p => p.value === volumeGoal.value.period)?.label || '');

const now = new Date();
const periodSessions = computed(() => {
  return sessions.value.filter(s => {
    const d = new Date(s.date);
    if (volumeGoal.value.period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0,0,0,0);
      return d >= weekStart;
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
});

const sessionVolume = (s) => {
  return (s.exercises || []).reduce((total, ex) => {
    return total + (ex.performed || []).reduce((sum, set) => {
      return sum + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0);
    }, 0);
  }, 0);
};

const currentVolume = computed(() => periodSessions.value.reduce((sum, s) => sum + sessionVolume(s), 0));
const progress      = computed(() => volumeGoal.value.target > 0 ? Math.min(100, Math.round((currentVolume.value / volumeGoal.value.target) * 100)) : 0);

const formatVolume = (v) => v >= 1000 ? `${(v/1000).toFixed(1)}t` : `${Math.round(v)}kg`;
const formatDate   = (iso) => new Date(iso).toLocaleDateString('pt-BR');
const saveGoal     = () => store.dispatch('goals/setVolumeGoal', { target: editTarget.value, period: editPeriod.value });
</script>
