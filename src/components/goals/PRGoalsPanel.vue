<template>
  <div class="pr-panel pb-16">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-bold">Recordes Pessoais</h3>
      <v-btn color="secondary" size="small" variant="tonal" prepend-icon="mdi-plus" @click="showDialog = true">Nova Meta</v-btn>
    </div>

    <div v-if="enrichedGoals.length === 0" class="text-center py-8 text-medium-emphasis">
      <v-icon icon="mdi-trophy-outline" size="48" class="mb-2"></v-icon>
      <div>Nenhuma meta de performance cadastrada.</div>
    </div>

    <v-card v-for="goal in enrichedGoals" :key="goal.id" color="surface" elevation="2" rounded="lg" class="mb-3 pa-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <div class="text-subtitle-1 font-weight-bold">🏋️ {{ goal.exercise }}</div>
          <div class="text-caption text-medium-emphasis">Meta: {{ goal.targetWeight }} {{ goal.unit }}</div>
        </div>
        <div class="text-right">
          <div v-if="goal.currentBest > 0" class="text-h6 font-weight-bold text-primary">{{ goal.currentBest }} {{ goal.unit }}</div>
          <div v-else class="text-caption text-medium-emphasis">Sem registro ainda</div>
          <v-btn icon="mdi-delete" variant="text" size="x-small" color="error" @click="deleteGoal(goal.id)"></v-btn>
        </div>
      </div>
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption text-medium-emphasis">Progresso</span>
        <span class="text-caption font-weight-bold" :class="goal.progress >= 100 ? 'text-success' : 'text-primary'">
          {{ goal.progress }}% <span v-if="goal.progress >= 100">🏆 Meta Atingida!</span>
        </span>
      </div>
      <v-progress-linear :model-value="goal.progress" :color="goal.progress >= 100 ? 'success' : goal.progress >= 75 ? 'warning' : 'primary'" bg-color="background" rounded height="10"></v-progress-linear>
      <div v-if="goal.currentBest > 0 && goal.progress < 100" class="text-caption text-medium-emphasis mt-1 text-right">
        Faltam {{ (goal.targetWeight - goal.currentBest).toFixed(1) }}{{ goal.unit }} para o PR
      </div>
    </v-card>

    <v-dialog v-model="showDialog" max-width="450">
      <v-card color="surface">
        <v-card-title class="text-h6 pa-4">Nova Meta de Performance</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.exercise" label="Nome do Exercício" placeholder="Ex: Supino Reto" variant="outlined" class="mb-3"></v-text-field>
          <v-row dense>
            <v-col cols="8"><v-text-field v-model.number="form.targetWeight" label="Peso Alvo" type="number" variant="outlined"></v-text-field></v-col>
            <v-col cols="4"><v-select v-model="form.unit" :items="['kg', 'lb']" label="Unidade" variant="outlined"></v-select></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDialog = false">Cancelar</v-btn>
          <v-btn color="secondary" @click="saveGoal">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const performanceGoals = computed(() => store.getters['goals/performanceGoals']);
const sessions         = computed(() => store.getters['history/allSessions']);

const enrichedGoals = computed(() => {
  return performanceGoals.value.map(goal => {
    let currentBest = 0;
    for (const session of sessions.value) {
      for (const ex of session.exercises || []) {
        if (ex.name?.toLowerCase() === goal.exercise?.toLowerCase()) {
          for (const set of ex.performed || []) {
            if (set.completed && set.weight > currentBest) currentBest = set.weight;
          }
        }
      }
    }
    const progress = goal.targetWeight > 0 ? Math.min(100, Math.round((currentBest / goal.targetWeight) * 100)) : 0;
    return { ...goal, currentBest, progress };
  });
});

const showDialog = ref(false);
const form = reactive({ exercise: '', targetWeight: 100, unit: 'kg' });

const saveGoal = () => {
  if (!form.exercise || !form.targetWeight) return;
  store.dispatch('goals/addPrGoal', { ...form });
  form.exercise = ''; form.targetWeight = 100;
  showDialog.value = false;
};

const deleteGoal = (id) => {
  if (confirm('Excluir esta meta de performance?')) store.dispatch('goals/deletePrGoal', id);
};
</script>
