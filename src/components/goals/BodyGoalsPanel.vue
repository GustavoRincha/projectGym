<template>
  <div class="body-panel pb-16">
    <!-- Card de Resumo de Progresso -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-5 border-thin">
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="text-subtitle-1 font-weight-bold text-primary">Progresso Geral</span>
        <v-chip
          v-if="goalProgressPercent > 0"
          size="small"
          :color="goalProgressPercent >= 100 ? 'success' : 'primary'"
          class="font-weight-bold"
        >
          {{ goalProgressPercent }}% Concluído
        </v-chip>
      </div>

      <v-row class="mb-4 text-center">
        <v-col cols="4">
          <div class="text-caption text-medium-emphasis">Inicial</div>
          <div class="text-h6 font-weight-bold">{{ initialWeight ? `${initialWeight} kg` : '--' }}</div>
        </v-col>
        <v-col cols="4">
          <div class="text-caption text-medium-emphasis">Atual</div>
          <div class="text-h6 font-weight-bold text-primary">{{ currentWeightVal ? `${currentWeightVal} kg` : '--' }}</div>
        </v-col>
        <v-col cols="4">
          <div class="text-caption text-medium-emphasis">Meta</div>
          <div class="text-h6 font-weight-bold text-secondary">{{ targetWeightVal ? `${targetWeightVal} kg` : '--' }}</div>
        </v-col>
      </v-row>

      <v-progress-linear
        :model-value="goalProgressPercent"
        color="primary"
        bg-color="background"
        height="10"
        rounded
        class="mb-3"
      ></v-progress-linear>

      <div class="d-flex justify-space-between align-center">
        <span class="text-caption text-medium-emphasis">
          Diferença total: <strong :class="parseFloat(totalProgressKg) <= 0 ? 'text-info' : 'text-secondary'">{{ parseFloat(totalProgressKg) > 0 ? '+' : '' }}{{ totalProgressKg }} kg</strong>
        </span>
        <span class="text-caption text-medium-emphasis font-weight-medium text-right">
          {{ weightDiff }}
        </span>
      </div>
    </v-card>

    <!-- Card 1: Gráfico de Evolução de Peso -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-5 border-thin">
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
        <span class="text-subtitle-1 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-scale-bathroom" class="mr-2" color="primary"></v-icon>
          Evolução do Peso Corporal
        </span>
        
        <v-btn-toggle
          v-model="filterPeriod"
          mandatory
          color="primary"
          density="compact"
          variant="outlined"
          selected-class="bg-primary-light"
        >
          <v-btn value="30d" size="small">30D</v-btn>
          <v-btn value="90d" size="small">90D</v-btn>
          <v-btn value="all" size="small">Tudo</v-btn>
        </v-btn-toggle>
      </div>

      <!-- SVG Chart -->
      <div v-if="filteredWeightLog.length >= 2" class="chart-container py-2">
        <svg viewBox="0 0 500 220" width="100%" height="100%" class="weight-svg-chart">
          <defs>
            <!-- Line glow filter -->
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <!-- Area gradient -->
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00E676" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#00E676" stop-opacity="0.0"/>
            </linearGradient>
          </defs>

          <!-- Grid lines & Y labels -->
          <g v-for="(line, idx) in gridLines" :key="idx">
            <line x1="45" :y1="line.y" x2="480" :y2="line.y" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <text x="35" :y="line.y + 3" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{{ line.value }}kg</text>
          </g>

          <!-- Target weight line -->
          <g v-if="targetWeightVal">
            <line x1="45" :y1="getY(targetWeightVal)" x2="480" :y2="getY(targetWeightVal)" stroke="#FF6D00" stroke-width="1.5" stroke-dasharray="6,4"/>
            <text x="475" :y="getY(targetWeightVal) - 6" text-anchor="end" fill="#FF6D00" font-size="8" font-weight="bold">Meta: {{ targetWeightVal }}kg</text>
          </g>

          <!-- Area under line -->
          <polygon :points="areaPoints" fill="url(#chartGradient)"/>

          <!-- Main weight line -->
          <polyline :points="chartPoints" fill="none" stroke="#00E676" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

          <!-- Dots -->
          <circle
            v-for="(p, i) in dataPoints"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="5"
            class="chart-dot"
            :class="{ 'glowing': hoveredPoint && hoveredPoint.index === i }"
            @mouseenter="hoveredPoint = { ...p, index: i }"
            @mouseleave="hoveredPoint = null"
          />

          <!-- Tooltip inside SVG -->
          <g v-if="hoveredPoint" class="svg-tooltip">
            <rect
              :x="hoveredPoint.x - 50"
              :y="hoveredPoint.y - 38"
              width="100"
              height="28"
              rx="6"
              fill="rgba(30, 30, 30, 0.95)"
              stroke="rgba(255, 255, 255, 0.15)"
              stroke-width="1"
            />
            <text
              :x="hoveredPoint.x"
              :y="hoveredPoint.y - 20"
              text-anchor="middle"
              fill="#ffffff"
              font-size="9"
              font-weight="bold"
            >
              {{ hoveredPoint.value }} kg - {{ formatDateShort(hoveredPoint.date) }}
            </text>
          </g>

          <!-- Date bounds labels -->
          <text x="45" y="212" text-anchor="start" fill="rgba(255,255,255,0.4)" font-size="8">
            {{ formatDate(filteredWeightLog[0].date) }}
          </text>
          <text x="480" y="212" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">
            {{ formatDate(filteredWeightLog[filteredWeightLog.length - 1].date) }}
          </text>
        </svg>
        <div class="text-center text-caption text-medium-emphasis mt-2">
          Passe o mouse ou toque nos pontos para ver detalhes.
        </div>
      </div>
      <div v-else class="text-center py-10 text-medium-emphasis">
        <v-icon icon="mdi-chart-bell-curve-cumulative" size="48" class="mb-2" color="rgba(255,255,255,0.2)"></v-icon>
        <div class="text-body-2">São necessários pelo menos 2 registros no período para gerar o gráfico.</div>
      </div>
    </v-card>

    <!-- Card 2: Gráfico de Evolução de Medidas & BF% -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-5 border-thin">
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
        <span class="text-subtitle-1 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-ruler" class="mr-2" color="secondary"></v-icon>
          Evolução de Medidas & BF%
        </span>
        
        <v-select
          v-model="activeMetric"
          :items="metricOptions"
          item-title="label"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 160px;"
        ></v-select>
      </div>

      <!-- SVG Chart for measurements -->
      <div v-if="metricData.length >= 2" class="chart-container py-2">
        <svg viewBox="0 0 500 220" width="100%" height="100%" class="weight-svg-chart">
          <defs>
            <filter id="glow-secondary" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FF6D00" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#FF6D00" stop-opacity="0.0"/>
            </linearGradient>
          </defs>

          <!-- Grid lines & Y labels -->
          <g v-for="(line, idx) in metricGridLines" :key="idx">
            <line x1="45" :y1="line.y" x2="480" :y2="line.y" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <text x="35" :y="line.y + 3" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{{ line.value }}{{ activeMetricSuffix }}</text>
          </g>

          <!-- Area under line -->
          <polygon :points="metricAreaPoints" fill="url(#metricGradient)"/>

          <!-- Main weight line -->
          <polyline :points="metricChartPoints" fill="none" stroke="#FF6D00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-secondary)"/>

          <!-- Dots -->
          <circle
            v-for="(p, i) in metricDataPoints"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="5"
            class="chart-dot secondary-dot"
            :class="{ 'glowing': hoveredMetricPoint && hoveredMetricPoint.index === i }"
            @mouseenter="hoveredMetricPoint = { ...p, index: i }"
            @mouseleave="hoveredMetricPoint = null"
          />

          <!-- Tooltip inside SVG -->
          <g v-if="hoveredMetricPoint" class="svg-tooltip">
            <rect
              :x="hoveredMetricPoint.x - 50"
              :y="hoveredMetricPoint.y - 38"
              width="100"
              height="28"
              rx="6"
              fill="rgba(30, 30, 30, 0.95)"
              stroke="rgba(255, 255, 255, 0.15)"
              stroke-width="1"
            />
            <text
              :x="hoveredMetricPoint.x"
              :y="hoveredMetricPoint.y - 20"
              text-anchor="middle"
              fill="#ffffff"
              font-size="9"
              font-weight="bold"
            >
              {{ hoveredMetricPoint.value }}{{ activeMetricSuffix }} - {{ formatDateShort(hoveredMetricPoint.date) }}
            </text>
          </g>

          <!-- Date bounds labels -->
          <text x="45" y="212" text-anchor="start" fill="rgba(255,255,255,0.4)" font-size="8">
            {{ formatDate(metricData[0].date) }}
          </text>
          <text x="480" y="212" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">
            {{ formatDate(metricData[metricData.length - 1].date) }}
          </text>
        </svg>
        <div class="text-center text-caption text-medium-emphasis mt-2">
          Passe o mouse ou toque nos pontos para ver detalhes.
        </div>
      </div>
      <div v-else class="text-center py-10 text-medium-emphasis">
        <v-icon icon="mdi-chart-bell-curve-cumulative" size="48" class="mb-2" color="rgba(255,255,255,0.2)"></v-icon>
        <div class="text-body-2">São necessários pelo menos 2 registros desta métrica para gerar o gráfico.</div>
      </div>
    </v-card>

    <!-- Registrar Peso e Configurações de Meta -->
    <v-row dense class="mb-4">
      <v-col cols="12" md="6" class="mb-2">
        <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border-thin h-100">
          <h3 class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
            <v-icon icon="mdi-scale-bathroom" class="mr-2" color="primary" size="small"></v-icon>
            Registrar Peso de Hoje
          </h3>
          <v-row dense align="center">
            <v-col cols="8">
              <v-text-field
                v-model.number="newWeight"
                label="Peso atual (kg)"
                placeholder="Ex: 75.8"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                @keyup.enter="logWeight"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" block height="40" rounded="pill" @click="logWeight">Salvar</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-2">
        <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border-thin h-100">
          <h3 class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
            <v-icon icon="mdi-bullseye-arrow" class="mr-2" color="secondary" size="small"></v-icon>
            Configurar Meta de Peso
          </h3>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="targetWeightInput"
                label="Meta (kg)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                @blur="saveBodyGoal"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="goalTypeInput"
                :items="goalTypes"
                item-title="label"
                item-value="value"
                label="Objetivo"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="saveBodyGoal"
              ></v-select>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Histórico de Peso (Sanfona) -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-4 border-thin">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel class="bg-surface border-none" style="box-shadow: none !important;">
          <v-expansion-panel-title class="text-caption font-weight-bold px-2 py-0">
            <v-icon icon="mdi-history" color="primary" size="small" class="mr-2"></v-icon>
            Ver Histórico de Peso ({{ sortedWeightLog.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text class="px-0">
            <div v-if="sortedWeightLog.length === 0" class="text-center py-4 text-medium-emphasis text-caption">
              Nenhum registro encontrado.
            </div>
            <div
              v-else
              v-for="(entry, i) in [...sortedWeightLog].reverse()"
              :key="i"
              class="d-flex justify-space-between align-center py-2 border-bottom-thin"
            >
              <span class="text-body-2">{{ formatDate(entry.date) }}</span>
              <span class="text-body-2 font-weight-bold">{{ entry.value }} kg</span>
              <v-btn
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="error"
                @click="deleteWeight(sortedWeightLog.length - 1 - i)"
              ></v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- Medidas Corporais -->
    <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-5 border-thin">
      <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
        <v-icon icon="mdi-ruler" class="mr-2" color="secondary"></v-icon>
        Registrar Medidas Corporais
      </h3>
      
      <v-row dense class="mb-2">
        <v-col v-for="m in measureFields" :key="m.key" cols="6">
          <v-text-field
            v-model.number="newMeasurement[m.key]"
            :label="m.label"
            type="number"
            variant="outlined"
            density="compact"
            suffix="cm"
            hide-details
            class="mb-2"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-btn color="secondary" block variant="tonal" rounded="pill" @click="logMeasurement" class="mb-4">
        Salvar Medidas de Hoje
      </v-btn>

      <v-divider class="mb-4"></v-divider>
      
      <div class="text-subtitle-2 font-weight-bold mb-3">Metas de Medidas</div>
      <v-row dense class="mb-4">
        <v-col v-for="m in measureFields" :key="`goal_${m.key}`" cols="6">
          <v-text-field
            v-model.number="measureGoals[m.goalsKey]"
            :label="`Meta ${m.label}`"
            type="number"
            variant="outlined"
            density="compact"
            suffix="cm"
            hide-details
            class="mb-2"
            @blur="saveBodyGoal"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-expansion-panels v-if="latestMeasurement" variant="accordion">
        <v-expansion-panel class="bg-surface border-none" style="box-shadow: none !important;">
          <v-expansion-panel-title class="text-caption font-weight-bold px-2 py-0">
            Último Registro de Medidas ({{ formatDate(latestMeasurement.date) }})
          </v-expansion-panel-title>
          <v-expansion-panel-text class="px-0">
            <v-row dense>
              <v-col v-for="m in measureFields" :key="`disp_${m.key}`" cols="6">
                <div v-if="latestMeasurement[m.key]" class="d-flex justify-space-between pa-2 rounded bg-background mb-1">
                  <span class="text-caption">{{ m.label }}</span>
                  <span class="text-caption font-weight-bold text-primary">{{ latestMeasurement[m.key] }}cm</span>
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- BF% (Gordura Corporal) -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-5 border-thin">
      <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
        <v-icon icon="mdi-fire" class="mr-2" color="primary"></v-icon>
        Registrar % Gordura Corporal
      </h3>
      <v-row dense class="mb-2" align="center">
        <v-col cols="5">
          <v-text-field
            v-model.number="newBf"
            label="Gordura (%)"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-btn color="primary" block height="40" rounded="pill" @click="logBf">Salvar</v-btn>
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model.number="targetBfInput"
            label="Meta (%)"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            @blur="saveBodyGoal"
          ></v-text-field>
        </v-col>
      </v-row>
      
      <div v-if="lastBf" class="d-flex justify-space-between mt-3 px-2">
        <span class="text-body-2">Atual: <strong class="text-primary">{{ lastBf.value }}%</strong></span>
        <span v-if="bodyGoals.targetBf" class="text-caption text-medium-emphasis">
          Meta: {{ bodyGoals.targetBf }}%
        </span>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const bodyGoals  = computed(() => store.getters['body/goals']);
const weightLog  = computed(() => store.getters['body/weightLog']);
const bfLog      = computed(() => store.getters['body/bfLog']);
const lastWeight = computed(() => store.getters['body/lastWeight']);
const lastBf     = computed(() => store.getters['body/lastBf']);
const measurements = computed(() => store.getters['body/measurements']);

const sortedWeightLog = computed(() => {
  return [...weightLog.value].sort((a, b) => new Date(a.date) - new Date(b.date));
});

const latestMeasurement = computed(() => {
  return measurements.value.length
    ? [...measurements.value].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
});

// Form inputs
const newWeight = ref(null);
const newBf = ref(null);
const targetWeightInput = ref(bodyGoals.value.targetWeight);
const targetBfInput = ref(bodyGoals.value.targetBf);
const goalTypeInput = ref(bodyGoals.value.weightGoalType);
const filterPeriod = ref('all');
const hoveredPoint = ref(null);

const activeMetric = ref('bf');
const hoveredMetricPoint = ref(null);

watch(bodyGoals, (newGoals) => {
  targetWeightInput.value = newGoals.targetWeight;
  targetBfInput.value = newGoals.targetBf;
  goalTypeInput.value = newGoals.weightGoalType;
  measureGoals.targetArm = newGoals.targetArm;
  measureGoals.targetWaist = newGoals.targetWaist;
  measureGoals.targetChest = newGoals.targetChest;
  measureGoals.targetThigh = newGoals.targetThigh;
  measureGoals.targetHip = newGoals.targetHip;
}, { deep: true });

const goalTypes = [
  { label: '📉 Emagrecer', value: 'lose' },
  { label: '📈 Ganhar Massa', value: 'gain' },
];

const measureFields = [
  { key: 'arm',   label: 'Braço',   goalsKey: 'targetArm'   },
  { key: 'waist', label: 'Cintura', goalsKey: 'targetWaist' },
  { key: 'chest', label: 'Peito',   goalsKey: 'targetChest' },
  { key: 'thigh', label: 'Coxa',    goalsKey: 'targetThigh' },
  { key: 'hip',   label: 'Quadril', goalsKey: 'targetHip'   },
];

const metricOptions = [
  { label: '💪 % Gordura (BF)', value: 'bf' },
  { label: '📏 Braço (cm)', value: 'arm' },
  { label: '📏 Cintura (cm)', value: 'waist' },
  { label: '📏 Peito (cm)', value: 'chest' },
  { label: '📏 Coxa (cm)', value: 'thigh' },
  { label: '📏 Quadril (cm)', value: 'hip' },
];

const newMeasurement = reactive({ arm: null, waist: null, chest: null, thigh: null, hip: null });
const measureGoals   = reactive({
  targetArm: bodyGoals.value.targetArm,
  targetWaist: bodyGoals.value.targetWaist,
  targetChest: bodyGoals.value.targetChest,
  targetThigh: bodyGoals.value.targetThigh,
  targetHip: bodyGoals.value.targetHip,
});

// Metric logic
const metricData = computed(() => {
  if (activeMetric.value === 'bf') {
    return [...bfLog.value]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({ date: entry.date, value: entry.value }));
  } else {
    const key = activeMetric.value;
    return [...measurements.value]
      .filter(entry => entry[key] !== null && entry[key] !== undefined && entry[key] > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({ date: entry.date, value: parseFloat(entry[key]) }));
  }
});

const activeMetricSuffix = computed(() => {
  return activeMetric.value === 'bf' ? '%' : 'cm';
});

// Filter weight log by selected period
const filteredWeightLog = computed(() => {
  if (filterPeriod.value === 'all') return sortedWeightLog.value;
  
  const cutoff = new Date();
  if (filterPeriod.value === '30d') {
    cutoff.setDate(cutoff.getDate() - 30);
  } else if (filterPeriod.value === '90d') {
    cutoff.setDate(cutoff.getDate() - 90);
  }
  return sortedWeightLog.value.filter(entry => new Date(entry.date) >= cutoff);
});

// Calculations for Overview Card
const initialWeight = computed(() => {
  return filteredWeightLog.value.length ? filteredWeightLog.value[0].value : null;
});

const currentWeightVal = computed(() => {
  return lastWeight.value ? lastWeight.value.value : null;
});

const targetWeightVal = computed(() => {
  return bodyGoals.value.targetWeight;
});

const totalProgressKg = computed(() => {
  if (!initialWeight.value || !currentWeightVal.value) return 0;
  return (currentWeightVal.value - initialWeight.value).toFixed(1);
});

const goalProgressPercent = computed(() => {
  if (!initialWeight.value || !currentWeightVal.value || !targetWeightVal.value) return 0;
  const initial = initialWeight.value;
  const current = currentWeightVal.value;
  const target = targetWeightVal.value;
  
  if (initial === target) return 100;
  
  // If weight loss goal
  if (bodyGoals.value.weightGoalType === 'lose') {
    if (current <= target) return 100;
    if (current >= initial) return 0;
    return Math.round(((initial - current) / (initial - target)) * 100);
  } else {
    // Weight gain goal
    if (current >= target) return 100;
    if (current <= initial) return 0;
    return Math.round(((current - initial) / (target - initial)) * 100);
  }
});

const weightDiff = computed(() => {
  if (!currentWeightVal.value || !targetWeightVal.value) return 'Sem meta definida';
  const diff = (currentWeightVal.value - targetWeightVal.value).toFixed(1);
  
  if (bodyGoals.value.weightGoalType === 'lose') {
    return diff <= 0 ? '🏆 Meta atingida!' : `Faltam ${diff} kg`;
  } else {
    const diffAbs = Math.abs(diff);
    return currentWeightVal.value >= targetWeightVal.value ? '🏆 Meta atingida!' : `Faltam ${diffAbs.toFixed(1)} kg`;
  }
});

// Formatting functions
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('pt-BR');
};

const formatDateShort = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

// SVG Graph Math
const W = 500;
const H = 220;
const PAD_X = 45;
const PAD_Y = 30;

// Weight Graph Math
const minVal = computed(() => {
  const vals = filteredWeightLog.value.map(v => v.value);
  if (targetWeightVal.value) vals.push(targetWeightVal.value);
  return Math.min(...vals) - 1.5;
});

const maxVal = computed(() => {
  const vals = filteredWeightLog.value.map(v => v.value);
  if (targetWeightVal.value) vals.push(targetWeightVal.value);
  return Math.max(...vals) + 1.5;
});

const valRange = computed(() => maxVal.value - minVal.value || 1);

const dateRange = computed(() => {
  if (filteredWeightLog.value.length < 2) return 1;
  const dates = filteredWeightLog.value.map(v => new Date(v.date).getTime());
  return Math.max(...dates) - Math.min(...dates) || 1;
});

const minDate = computed(() => {
  return filteredWeightLog.value.length ? new Date(filteredWeightLog.value[0].date).getTime() : 0;
});

const getY = (v) => {
  return H - PAD_Y - ((v - minVal.value) / valRange.value) * (H - PAD_Y * 2);
};

const gridLines = computed(() => {
  const lines = [];
  const count = 4;
  const step = valRange.value / (count - 1);
  for (let i = 0; i < count; i++) {
    const val = minVal.value + step * i;
    lines.push({
      value: Math.round(val),
      y: getY(val)
    });
  }
  return lines;
});

const dataPoints = computed(() => {
  if (filteredWeightLog.value.length === 0) return [];
  if (filteredWeightLog.value.length === 1) {
    return [{
      x: W / 2,
      y: getY(filteredWeightLog.value[0].value),
      value: filteredWeightLog.value[0].value,
      date: filteredWeightLog.value[0].date
    }];
  }
  
  return filteredWeightLog.value.map(entry => ({
    x: PAD_X + ((new Date(entry.date).getTime() - minDate.value) / dateRange.value) * (W - PAD_X - 40),
    y: getY(entry.value),
    value: entry.value,
    date: entry.date
  }));
});

const chartPoints = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ');
});

const areaPoints = computed(() => {
  if (dataPoints.value.length < 2) return '';
  const first = dataPoints.value[0];
  const last = dataPoints.value[dataPoints.value.length - 1];
  const baselineY = H - PAD_Y;
  
  return `${first.x},${baselineY} ` + 
         dataPoints.value.map(p => `${p.x},${p.y}`).join(' ') + 
         ` ${last.x},${baselineY}`;
});

// Metric Graph Math
const minMetricVal = computed(() => {
  const vals = metricData.value.map(v => v.value);
  return vals.length ? Math.min(...vals) - 1.5 : 0;
});
const maxMetricVal = computed(() => {
  const vals = metricData.value.map(v => v.value);
  return vals.length ? Math.max(...vals) + 1.5 : 10;
});
const metricValRange = computed(() => maxMetricVal.value - minMetricVal.value || 1);

const metricDateRange = computed(() => {
  if (metricData.value.length < 2) return 1;
  const dates = metricData.value.map(v => new Date(v.date).getTime());
  return Math.max(...dates) - Math.min(...dates) || 1;
});

const minMetricDate = computed(() => {
  return metricData.value.length ? new Date(metricData.value[0].date).getTime() : 0;
});

const getMetricY = (v) => {
  return H - PAD_Y - ((v - minMetricVal.value) / metricValRange.value) * (H - PAD_Y * 2);
};

const metricGridLines = computed(() => {
  const lines = [];
  const count = 4;
  const step = metricValRange.value / (count - 1);
  for (let i = 0; i < count; i++) {
    const val = minMetricVal.value + step * i;
    lines.push({
      value: val % 1 === 0 ? val : parseFloat(val.toFixed(1)),
      y: getMetricY(val)
    });
  }
  return lines;
});

const metricDataPoints = computed(() => {
  if (metricData.value.length === 0) return [];
  if (metricData.value.length === 1) {
    return [{
      x: W / 2,
      y: getMetricY(metricData.value[0].value),
      value: metricData.value[0].value,
      date: metricData.value[0].date
    }];
  }
  
  return metricData.value.map(entry => ({
    x: PAD_X + ((new Date(entry.date).getTime() - minMetricDate.value) / metricDateRange.value) * (W - PAD_X - 40),
    y: getMetricY(entry.value),
    value: entry.value,
    date: entry.date
  }));
});

const metricChartPoints = computed(() => {
  return metricDataPoints.value.map(p => `${p.x},${p.y}`).join(' ');
});

const metricAreaPoints = computed(() => {
  if (metricDataPoints.value.length < 2) return '';
  const first = metricDataPoints.value[0];
  const last = metricDataPoints.value[metricDataPoints.value.length - 1];
  const baselineY = H - PAD_Y;
  
  return `${first.x},${baselineY} ` + 
         metricDataPoints.value.map(p => `${p.x},${p.y}`).join(' ') + 
         ` ${last.x},${baselineY}`;
});

// Actions
const saveBodyGoal = () => {
  store.dispatch('body/setGoals', {
    targetWeight: targetWeightInput.value || null,
    weightGoalType: goalTypeInput.value,
    targetBf: targetBfInput.value || null,
    ...measureGoals,
  });
};

const logWeight = () => {
  if (!newWeight.value || isNaN(newWeight.value)) return;
  store.dispatch('body/logWeight', { value: newWeight.value });
  newWeight.value = null;
};

const logBf = () => {
  if (!newBf.value || isNaN(newBf.value)) return;
  store.dispatch('body/logBf', { value: newBf.value });
  newBf.value = null;
};

const logMeasurement = () => {
  const hasData = Object.values(newMeasurement).some(v => v);
  if (!hasData) return;
  store.dispatch('body/logMeasurement', { ...newMeasurement });
  Object.keys(newMeasurement).forEach(k => (newMeasurement[k] = null));
};

const deleteWeight = (index) => {
  if (confirm('Tem certeza que deseja excluir este registro de peso?')) {
    store.dispatch('body/deleteWeight', index);
  }
};
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.border-none {
  border: none !important;
}
.border-bottom-thin {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.chart-container {
  position: relative;
  background: rgba(255, 255, 255, 0.015);
  border-radius: 12px;
  overflow: visible;
}
.weight-svg-chart {
  display: block;
  width: 100%;
  height: 220px;
  overflow: visible;
}
.chart-dot {
  fill: #00E676;
  stroke: #1E1E1E;
  stroke-width: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chart-dot:hover, .chart-dot.glowing {
  fill: #ff9800;
  r: 7px;
  stroke-width: 2.5px;
}
.chart-dot.secondary-dot {
  fill: #FF6D00;
}
.chart-dot.secondary-dot:hover, .chart-dot.secondary-dot.glowing {
  fill: #00E676;
}
.svg-tooltip rect {
  filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
}
.bg-primary-light {
  background-color: rgba(0, 230, 118, 0.1) !important;
}
</style>
