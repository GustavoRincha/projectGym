<template>
  <div class="body-panel pb-16">
    <!-- Weight Section -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4 border-t-4 border-t-primary">
      <div class="d-flex align-center justify-space-between mb-3">
        <h3 class="text-h6 font-weight-bold">⚖️ Peso Corporal</h3>
        <div class="d-flex align-center gap-2">
          <v-chip size="small" :color="bodyGoals.weightGoalType === 'lose' ? 'info' : 'secondary'" variant="tonal">
            {{ bodyGoals.weightGoalType === 'lose' ? '📉 Emagrecimento' : '📈 Ganho de massa' }}
          </v-chip>
        </div>
      </div>

      <!-- Goal settings row -->
      <v-row dense class="mb-3">
        <v-col cols="5">
          <v-text-field v-model.number="newWeight" label="Registrar peso (kg)" type="number" variant="outlined" density="compact" clearable></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-btn color="primary" block height="40" @click="logWeight">Salvar</v-btn>
        </v-col>
        <v-col cols="4">
          <v-text-field v-model.number="targetWeightInput" label="Meta (kg)" type="number" variant="outlined" density="compact" @blur="saveBodyGoal"></v-text-field>
        </v-col>
      </v-row>
      <v-select v-model="goalTypeInput" :items="goalTypes" item-title="label" item-value="value" label="Objetivo" variant="outlined" density="compact" class="mb-3" @update:model-value="saveBodyGoal"></v-select>

      <!-- SVG Line Chart -->
      <div v-if="sortedWeightLog.length >= 2" class="chart-container mb-2">
        <svg :viewBox="`0 0 ${W} ${H}`" width="100%" preserveAspectRatio="none">
          <!-- Grid lines -->
          <line v-for="i in 4" :key="i" x1="0" :y1="(H/4)*i" :x2="W" :y2="(H/4)*i" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
          <!-- Target line -->
          <line v-if="bodyGoals.targetWeight" x1="0" :y1="getY(bodyGoals.targetWeight)" :x2="W" :y2="getY(bodyGoals.targetWeight)" stroke="#FF6D00" stroke-width="1.5" stroke-dasharray="5,3"/>
          <!-- Weight line -->
          <polyline :points="chartPoints" fill="none" stroke="#00E676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Data points -->
          <circle v-for="(p, i) in dataPoints" :key="i" :cx="p.x" :cy="p.y" r="4" fill="#00E676" stroke="#121212" stroke-width="2"/>
        </svg>
        <div class="chart-labels">
          <span v-if="bodyGoals.targetWeight" class="target-label text-caption" :style="{ top: `${getYPercent(bodyGoals.targetWeight)}%` }">
            🎯 {{ bodyGoals.targetWeight }}kg
          </span>
        </div>
      </div>
      <div v-else-if="sortedWeightLog.length === 1" class="text-caption text-medium-emphasis mb-2">
        Adicione ao menos 2 registros para ver o gráfico.
      </div>

      <!-- Last weight + progress to goal -->
      <div v-if="lastWeight" class="d-flex justify-space-between align-center mb-2">
        <span class="text-body-2">Último: <strong class="text-primary">{{ lastWeight.value }}kg</strong></span>
        <span v-if="bodyGoals.targetWeight" class="text-caption text-medium-emphasis">
          Meta: {{ bodyGoals.targetWeight }}kg ({{ weightDiff }})
        </span>
      </div>

      <!-- Weight history list -->
      <v-expansion-panels variant="accordion">
        <v-expansion-panel class="bg-background">
          <v-expansion-panel-title class="text-caption">Ver histórico ({{ sortedWeightLog.length }})</v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-for="(entry, i) in [...sortedWeightLog].reverse()" :key="i" class="d-flex justify-space-between align-center mb-1">
              <span class="text-body-2">{{ formatDate(entry.date) }}</span>
              <span class="text-body-2 font-weight-bold">{{ entry.value }} kg</span>
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteWeight(sortedWeightLog.length - 1 - i)"></v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- Measurements Section -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4 border-t-4 border-t-secondary">
      <h3 class="text-h6 font-weight-bold mb-3">📏 Medidas Corporais</h3>

      <v-row dense class="mb-2">
        <v-col v-for="m in measureFields" :key="m.key" cols="6">
          <v-text-field
            v-model.number="newMeasurement[m.key]"
            :label="m.label"
            type="number"
            variant="outlined"
            density="compact"
            suffix="cm"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-btn color="secondary" block variant="tonal" @click="logMeasurement" class="mb-4">Salvar Medidas de Hoje</v-btn>

      <!-- Goals for measures -->
      <div class="text-subtitle-2 font-weight-bold mb-2">Metas de Medidas</div>
      <v-row dense>
        <v-col v-for="m in measureFields" :key="`goal_${m.key}`" cols="6">
          <v-text-field
            v-model.number="measureGoals[m.goalsKey]"
            :label="`Meta ${m.label}`"
            type="number"
            variant="outlined"
            density="compact"
            suffix="cm"
            @blur="saveBodyGoal"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Latest measurements comparison -->
      <div v-if="latestMeasurement" class="mt-2">
        <div class="text-subtitle-2 font-weight-bold mb-2">Último Registro ({{ formatDate(latestMeasurement.date) }})</div>
        <v-row dense>
          <v-col v-for="m in measureFields" :key="`disp_${m.key}`" cols="6">
            <div v-if="latestMeasurement[m.key]" class="d-flex justify-space-between pa-2 rounded bg-background mb-1">
              <span class="text-caption">{{ m.label }}</span>
              <span class="text-caption font-weight-bold text-primary">{{ latestMeasurement[m.key] }}cm</span>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- BF% Section -->
    <v-card color="surface" elevation="2" rounded="lg" class="pa-4">
      <h3 class="text-h6 font-weight-bold mb-3">💪 % Gordura Corporal</h3>
      <v-row dense class="mb-2">
        <v-col cols="5">
          <v-text-field v-model.number="newBf" label="% Gordura atual" type="number" variant="outlined" density="compact"></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-btn color="primary" block height="40" @click="logBf">Salvar</v-btn>
        </v-col>
        <v-col cols="4">
          <v-text-field v-model.number="targetBfInput" label="Meta (%)" type="number" variant="outlined" density="compact" @blur="saveBodyGoal"></v-text-field>
        </v-col>
      </v-row>
      <div v-if="lastBf" class="d-flex justify-space-between">
        <span class="text-body-2">Atual: <strong class="text-primary">{{ lastBf.value }}%</strong></span>
        <span v-if="bodyGoals.targetBf" class="text-caption text-medium-emphasis">Meta: {{ bodyGoals.targetBf }}%</span>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const bodyGoals  = computed(() => store.getters['body/goals']);
const weightLog  = computed(() => store.getters['body/weightLog']);
const bfLog      = computed(() => store.getters['body/bfLog']);
const lastWeight = computed(() => store.getters['body/lastWeight']);
const lastBf     = computed(() => store.getters['body/lastBf']);
const measurements = computed(() => store.getters['body/measurements']);

const sortedWeightLog = computed(() => [...weightLog.value].sort((a, b) => new Date(a.date) - new Date(b.date)));
const latestMeasurement = computed(() => measurements.value.length ? [...measurements.value].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null);

// Form fields
const newWeight     = ref(null);
const newBf         = ref(null);
const targetWeightInput = ref(bodyGoals.value.targetWeight);
const targetBfInput     = ref(bodyGoals.value.targetBf);
const goalTypeInput     = ref(bodyGoals.value.weightGoalType);

const measureFields = [
  { key: 'arm',   label: 'Braço',   goalsKey: 'targetArm'   },
  { key: 'waist', label: 'Cintura', goalsKey: 'targetWaist' },
  { key: 'chest', label: 'Peito',   goalsKey: 'targetChest' },
  { key: 'thigh', label: 'Coxa',    goalsKey: 'targetThigh' },
  { key: 'hip',   label: 'Quadril', goalsKey: 'targetHip'   },
];
const goalTypes = [
  { label: '📉 Emagrecer', value: 'lose' },
  { label: '📈 Ganhar massa', value: 'gain' },
];

const newMeasurement = reactive({ arm: null, waist: null, chest: null, thigh: null, hip: null });
const measureGoals   = reactive({
  targetArm: bodyGoals.value.targetArm,
  targetWaist: bodyGoals.value.targetWaist,
  targetChest: bodyGoals.value.targetChest,
  targetThigh: bodyGoals.value.targetThigh,
  targetHip: bodyGoals.value.targetHip,
});

// Chart
const W = 320, H = 120, PAD = 16;
const minVal = computed(() => {
  const vals = sortedWeightLog.value.map(v => v.value);
  if (bodyGoals.value.targetWeight) vals.push(bodyGoals.value.targetWeight);
  return Math.min(...vals) - 2;
});
const maxVal = computed(() => {
  const vals = sortedWeightLog.value.map(v => v.value);
  if (bodyGoals.value.targetWeight) vals.push(bodyGoals.value.targetWeight);
  return Math.max(...vals) + 2;
});
const valRange  = computed(() => maxVal.value - minVal.value || 1);
const dateRange = computed(() => {
  if (sortedWeightLog.value.length < 2) return 1;
  const dates = sortedWeightLog.value.map(v => new Date(v.date).getTime());
  return Math.max(...dates) - Math.min(...dates) || 1;
});
const minDate = computed(() => sortedWeightLog.value.length ? new Date(sortedWeightLog.value[0].date).getTime() : 0);

const getY = (v) => H - PAD - ((v - minVal.value) / valRange.value) * (H - PAD * 2);
const getYPercent = (v) => ((getY(v) / H) * 100).toFixed(1);

const dataPoints = computed(() => sortedWeightLog.value.map(entry => ({
  x: PAD + ((new Date(entry.date).getTime() - minDate.value) / dateRange.value) * (W - PAD * 2),
  y: getY(entry.value),
})));
const chartPoints = computed(() => dataPoints.value.map(p => `${p.x},${p.y}`).join(' '));

// Computed diff
const weightDiff = computed(() => {
  if (!lastWeight.value || !bodyGoals.value.targetWeight) return '';
  const diff = (lastWeight.value.value - bodyGoals.value.targetWeight).toFixed(1);
  return diff > 0 ? `Faltam ${diff}kg` : '✅ Meta atingida!';
});

const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR');

const saveBodyGoal = () => {
  store.dispatch('body/setGoals', {
    targetWeight:   targetWeightInput.value,
    weightGoalType: goalTypeInput.value,
    targetBf:       targetBfInput.value,
    ...measureGoals,
  });
};

const logWeight = () => {
  if (!newWeight.value) return;
  store.dispatch('body/logWeight', { value: newWeight.value });
  store.dispatch('gamification/addXp', 10);
  newWeight.value = null;
};
const logBf = () => {
  if (!newBf.value) return;
  store.dispatch('body/logBf', { value: newBf.value });
  newBf.value = null;
};
const logMeasurement = () => {
  const hasData = Object.values(newMeasurement).some(v => v);
  if (!hasData) return;
  store.dispatch('body/logMeasurement', { ...newMeasurement });
  Object.keys(newMeasurement).forEach(k => (newMeasurement[k] = null));
};
const deleteWeight = (index) => store.dispatch('body/deleteWeight', index);
</script>

<style scoped>
.chart-container { position: relative; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 4px; }
.chart-labels { position: absolute; top: 0; right: 4px; height: 100%; pointer-events: none; }
.target-label { position: absolute; right: 0; transform: translateY(-50%); background: rgba(255,109,0,0.15); padding: 1px 4px; border-radius: 4px; color: #FF6D00; font-size: 10px; white-space: nowrap; }
</style>
