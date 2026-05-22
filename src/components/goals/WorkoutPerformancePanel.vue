<template>
  <div class="performance-panel pb-16">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      <div class="text-body-2 text-medium-emphasis mt-3">Carregando estatísticas...</div>
    </div>

    <div v-else-if="sessions.length === 0" class="text-center py-12 text-medium-emphasis">
      <v-icon icon="mdi-history" size="64" class="mb-4" color="rgba(255, 255, 255, 0.15)"></v-icon>
      <h3 class="text-h6 font-weight-bold text-white mb-1">Nenhum treino finalizado</h3>
      <p class="text-body-2 text-medium-emphasis px-6">
        Ao completar seus treinos, os gráficos de volume de carga e histórico detalhado aparecerão aqui para acompanhar sua sobrecarga progressiva.
      </p>
    </div>

    <div v-else>
      <!-- Stats Row -->
      <v-row dense class="mb-4">
        <v-col cols="6" sm="3">
          <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border-thin text-center h-100">
            <div class="text-caption text-medium-emphasis mb-1">Volume Total</div>
            <div class="text-h6 font-weight-bold text-accent">{{ formatVolume(stats.totalVolume) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border-thin text-center h-100">
            <div class="text-caption text-medium-emphasis mb-1">Média por Treino</div>
            <div class="text-h6 font-weight-bold text-accent">{{ formatVolume(stats.avgVolume) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border-thin text-center h-100">
            <div class="text-caption text-medium-emphasis mb-1">Recorde Volume</div>
            <div class="text-h6 font-weight-bold text-accent">{{ formatVolume(stats.maxVolume) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card color="surface" elevation="2" rounded="xl" class="pa-4 border-thin text-center h-100">
            <div class="text-caption text-medium-emphasis mb-1">Treinos Feitos</div>
            <div class="text-h6 font-weight-bold text-accent">{{ stats.count }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Chart Card -->
      <v-card color="surface" elevation="2" rounded="xl" class="mb-4 pa-5 border-thin">
        <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
          <span class="text-subtitle-1 font-weight-bold d-flex align-center text-white">
            <v-icon icon="mdi-chart-line" class="mr-2" color="accent"></v-icon>
            Volume de Carga por Treino
          </span>

          <v-btn-toggle
            v-model="filterPeriod"
            mandatory
            color="accent"
            density="compact"
            variant="outlined"
            selected-class="bg-accent-light"
          >
            <v-btn value="30d" size="small">30D</v-btn>
            <v-btn value="90d" size="small">90D</v-btn>
            <v-btn value="all" size="small">Tudo</v-btn>
          </v-btn-toggle>
        </div>

        <!-- SVG Volume Chart -->
        <div v-if="chartSessions.length >= 2" class="chart-container py-2">
          <svg viewBox="0 0 500 220" width="100%" height="100%" class="performance-svg-chart">
            <defs>
              <!-- Line glow filter -->
              <filter id="glow-accent" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <!-- Area gradient -->
              <linearGradient id="chartAccentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2979FF" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#2979FF" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Grid lines & Y labels -->
            <g v-for="(line, idx) in gridLines" :key="idx">
              <line x1="45" :y1="line.y" x2="480" :y2="line.y" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <text x="35" :y="line.y + 3" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{{ formatVolume(line.value) }}</text>
            </g>

            <!-- Area under line -->
            <polygon :points="areaPoints" fill="url(#chartAccentGradient)"/>

            <!-- Main volume line -->
            <polyline :points="chartPoints" fill="none" stroke="#2979FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-accent)"/>

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
                :x="tooltipX - 75"
                :y="hoveredPoint.y - 52"
                width="150"
                height="42"
                rx="8"
                fill="rgba(30, 30, 30, 0.95)"
                stroke="rgba(41, 121, 255, 0.5)"
                stroke-width="1.5"
              />
              <line
                :x1="hoveredPoint.x"
                :y1="hoveredPoint.y - 10"
                :x2="hoveredPoint.x"
                :y2="hoveredPoint.y"
                stroke="rgba(41, 121, 255, 0.7)"
                stroke-width="1"
                stroke-dasharray="2,2"
              />
              <text
                :x="tooltipX"
                :y="hoveredPoint.y - 38"
                text-anchor="middle"
                fill="#ffffff"
                font-size="9"
                font-weight="bold"
              >
                {{ truncateText(hoveredPoint.routineName || 'Treino Livre', 22) }}
              </text>
              <text
                :x="tooltipX"
                :y="hoveredPoint.y - 24"
                text-anchor="middle"
                fill="#2979FF"
                font-size="9"
                font-weight="bold"
              >
                {{ formatVolume(hoveredPoint.value) }} — {{ formatDateShort(hoveredPoint.date) }}
              </text>
            </g>

            <!-- Date bounds labels -->
            <text x="45" y="212" text-anchor="start" fill="rgba(255,255,255,0.4)" font-size="8">
              {{ formatDate(chartSessions[0].date) }}
            </text>
            <text x="480" y="212" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">
              {{ formatDate(chartSessions[chartSessions.length - 1].date) }}
            </text>
          </svg>
          <div class="text-center text-caption text-medium-emphasis mt-2">
            Passe o mouse ou toque nos pontos para ver detalhes de carga.
          </div>
        </div>
        <div v-else class="text-center py-10 text-medium-emphasis">
          <v-icon icon="mdi-chart-bell-curve-cumulative" size="48" class="mb-2" color="rgba(255,255,255,0.2)"></v-icon>
          <div class="text-body-2">São necessários pelo menos 2 treinos com carga no período para gerar o gráfico.</div>
        </div>
      </v-card>

      <!-- History Section Header & Search -->
      <div class="d-flex flex-column gap-2 mb-3">
        <h3 class="text-subtitle-1 font-weight-bold text-white d-flex align-center pl-1">
          <v-icon icon="mdi-history" class="mr-2" color="primary"></v-icon>
          Histórico e Dados de Cada Treino
        </h3>
        <v-text-field
          v-model="searchRoutine"
          label="Buscar treino por nome..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          rounded="pill"
          class="mt-1"
        ></v-text-field>
      </div>

      <!-- Expandable Workout Sessions -->
      <div v-if="filteredWorkoutList.length === 0" class="text-center py-8 text-medium-emphasis text-body-2">
        Nenhum treino correspondente à busca.
      </div>
      <div v-else>
        <v-card
          v-for="session in filteredWorkoutList"
          :key="session.id"
          color="surface"
          elevation="2"
          rounded="xl"
          class="mb-3 border-thin"
        >
          <v-expansion-panels variant="accordion">
            <v-expansion-panel class="bg-surface border-none" style="box-shadow: none !important;">
              <v-expansion-panel-title class="px-4 py-3">
                <div class="d-flex align-center w-100 flex-wrap justify-space-between gap-2 pr-2">
                  <div class="d-flex align-center">
                    <v-avatar size="36" class="mr-3" style="background-color: rgba(41, 121, 255, 0.15) !important;">
                      <v-icon :icon="session.volume > 0 ? 'mdi-dumbbell' : 'mdi-heart-pulse'" color="accent"></v-icon>
                    </v-avatar>
                    <div class="text-left">
                      <div class="text-subtitle-2 font-weight-bold text-white">{{ session.routineName || 'Treino Livre' }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatDateFull(session.date) }} • {{ formatDuration(session.duration) }}
                      </div>
                    </div>
                  </div>
                  <div class="d-flex align-center gap-1">
                    <v-chip
                      v-if="session.volume > 0"
                      size="small"
                      color="accent"
                      variant="flat"
                      class="font-weight-bold text-white"
                    >
                      {{ formatVolume(session.volume) }}
                    </v-chip>
                    <v-chip
                      v-if="hasCardio(session)"
                      size="small"
                      color="secondary"
                      variant="tonal"
                      class="font-weight-bold"
                    >
                      Cardio
                    </v-chip>
                  </div>
                </div>
              </v-expansion-panel-title>
              
              <v-expansion-panel-text class="px-0 pt-0 pb-2">
                <v-divider class="mb-3"></v-divider>
                
                <div class="px-2 text-left">
                  <!-- Muscular Exercises -->
                  <div
                    v-for="ex in getMuscularExercises(session)"
                    :key="ex.id"
                    class="mb-4 pl-3"
                    style="border-left: 2px solid rgba(var(--v-theme-accent), 0.5);"
                  >
                    <div class="text-body-2 font-weight-bold mb-1 text-white">{{ ex.name }}</div>
                    <div class="d-flex flex-column gap-1 pl-2">
                      <div
                        v-for="(set, sIdx) in getCompletedSets(ex)"
                        :key="sIdx"
                        class="text-caption text-medium-emphasis d-flex align-center"
                      >
                        <v-icon icon="mdi-circle-medium" color="accent" size="x-small" class="mr-1"></v-icon>
                        <span>Série {{ sIdx + 1 }}: <strong class="text-white">{{ set.weight }}kg</strong> × <strong class="text-white">{{ set.reps }}</strong> repetições</span>
                      </div>
                      <div v-if="getCompletedSets(ex).length === 0" class="text-caption text-medium-emphasis italic">
                        Nenhuma série concluída.
                      </div>
                    </div>
                    
                    <div v-if="ex.notes" class="text-caption text-medium-emphasis pl-2 mt-1 italic">
                      <v-icon icon="mdi-note-text-outline" size="x-small" class="mr-1"></v-icon>
                      {{ ex.notes }}
                    </div>
                  </div>
                  
                  <!-- Cardio Exercises -->
                  <div v-if="getCardioExercises(session).length > 0" class="mb-4 pl-3" style="border-left: 2px solid rgba(var(--v-theme-secondary), 0.5);">
                    <div class="text-body-2 font-weight-bold mb-2 text-secondary">
                      <v-icon icon="mdi-heart-pulse" size="small" class="mr-1"></v-icon>
                      Cardio Realizado
                    </div>
                    <div
                      v-for="cardio in getCardioExercises(session)"
                      :key="cardio.id"
                      class="text-caption text-medium-emphasis pl-2 mb-1 d-flex align-center"
                    >
                      <v-icon :icon="getCardioIcon(cardio.name)" size="x-small" color="secondary" class="mr-2"></v-icon>
                      <span>
                        <strong>{{ cardio.name }}</strong>: {{ cardio.duration }} min
                        <span v-if="cardio.distance"> / {{ cardio.distance }} km</span>
                      </span>
                    </div>
                  </div>

                  <!-- Session Notes -->
                  <div v-if="getSessionNotes(session)" class="mt-2 pl-3 py-2 bg-background rounded-lg border-thin">
                    <div class="text-caption font-weight-bold text-primary mb-1">
                      <v-icon icon="mdi-comment-text-outline" size="x-small" class="mr-1"></v-icon>
                      Observações do Treino
                    </div>
                    <p class="text-caption text-medium-emphasis mb-0 pr-2 pb-1">{{ getSessionNotes(session) }}</p>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const sessions = computed(() => store.getters['history/allSessions']);
const loading = computed(() => store.getters['history/isLoading']);

const filterPeriod = ref('all');
const hoveredPoint = ref(null);
const searchRoutine = ref('');

// Calculations
const sessionsWithVolume = computed(() => {
  return sessions.value.map(s => {
    const vol = (s.exercises || []).reduce((total, ex) => {
      if (ex.isNotes || ex.isCardio) return total;
      return total + (ex.performed || []).reduce((sum, set) => {
        return sum + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0);
      }, 0);
    }, 0);
    return {
      ...s,
      volume: vol
    };
  });
});

const chartSessions = computed(() => {
  const filtered = sessionsWithVolume.value
    .filter(s => s.volume > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (filterPeriod.value === 'all') return filtered;
  
  const cutoff = new Date();
  if (filterPeriod.value === '30d') {
    cutoff.setDate(cutoff.getDate() - 30);
  } else if (filterPeriod.value === '90d') {
    cutoff.setDate(cutoff.getDate() - 90);
  }
  return filtered.filter(entry => new Date(entry.date) >= cutoff);
});

const stats = computed(() => {
  const activeSessions = sessionsWithVolume.value.filter(s => {
    if (filterPeriod.value === 'all') return true;
    const cutoff = new Date();
    if (filterPeriod.value === '30d') {
      cutoff.setDate(cutoff.getDate() - 30);
    } else if (filterPeriod.value === '90d') {
      cutoff.setDate(cutoff.getDate() - 90);
    }
    return new Date(s.date) >= cutoff;
  });

  const volSessions = activeSessions.filter(s => s.volume > 0);
  const totalVolume = volSessions.reduce((sum, s) => sum + s.volume, 0);
  const avgVolume = volSessions.length ? Math.round(totalVolume / volSessions.length) : 0;
  const maxVolume = volSessions.length ? Math.max(...volSessions.map(s => s.volume)) : 0;
  const count = activeSessions.length;

  return {
    totalVolume,
    avgVolume,
    maxVolume,
    count
  };
});

const filteredWorkoutList = computed(() => {
  const sorted = [...sessionsWithVolume.value].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!searchRoutine.value) return sorted;
  const term = searchRoutine.value.toLowerCase();
  return sorted.filter(s => s.routineName?.toLowerCase().includes(term));
});

// Formatting functions
const formatVolume = (v) => {
  if (v === 0) return '0 kg';
  return v >= 1000 ? `${(v / 1000).toFixed(1)}t` : `${Math.round(v)} kg`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('pt-BR');
};

const formatDateShort = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const formatDateFull = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('pt-BR', options);
};

const truncateText = (text, maxLen) => {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen - 3) + '...' : text;
};

// SVG Graph Math
const W = 500;
const H = 220;
const PAD_X = 45;
const PAD_Y = 30;

const minVal = computed(() => {
  const vals = chartSessions.value.map(s => s.volume);
  if (!vals.length) return 0;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return Math.max(0, min - (max - min) * 0.15 - 100);
});

const maxVal = computed(() => {
  const vals = chartSessions.value.map(s => s.volume);
  if (!vals.length) return 1000;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return max + (max - min) * 0.15 + 100;
});

const valRange = computed(() => maxVal.value - minVal.value || 1);

const dateRange = computed(() => {
  if (chartSessions.value.length < 2) return 1;
  const dates = chartSessions.value.map(s => new Date(s.date).getTime());
  return Math.max(...dates) - Math.min(...dates) || 1;
});

const minDate = computed(() => {
  return chartSessions.value.length ? new Date(chartSessions.value[0].date).getTime() : 0;
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
  if (chartSessions.value.length === 0) return [];
  if (chartSessions.value.length === 1) {
    return [{
      x: W / 2,
      y: getY(chartSessions.value[0].volume),
      value: chartSessions.value[0].volume,
      date: chartSessions.value[0].date,
      routineName: chartSessions.value[0].routineName
    }];
  }
  
  return chartSessions.value.map(s => ({
    x: PAD_X + ((new Date(s.date).getTime() - minDate.value) / dateRange.value) * (W - PAD_X - 40),
    y: getY(s.volume),
    value: s.volume,
    date: s.date,
    routineName: s.routineName
  }));
});

const tooltipX = computed(() => {
  if (!hoveredPoint.value) return 0;
  const x = hoveredPoint.value.x;
  if (x < 80) return 80;
  if (x > W - 80) return W - 80;
  return x;
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

// Helpers for expandable template
const getMuscularExercises = (session) => {
  return (session.exercises || []).filter(e => !e.isNotes && !e.isCardio);
};

const getCompletedSets = (ex) => {
  return (ex.performed || []).filter(s => s.completed);
};

const getCardioExercises = (session) => {
  return (session.exercises || []).filter(e => e.isCardio);
};

const getSessionNotes = (session) => {
  const notesObj = (session.exercises || []).find(e => e.isNotes);
  return notesObj ? notesObj.notes : '';
};

const hasCardio = (session) => {
  return (session.exercises || []).some(e => e.isCardio);
};

const getCardioIcon = (name) => {
  if (!name || typeof name !== 'string') return 'mdi-heart-pulse';
  const lower = name.toLowerCase();
  if (lower.includes('esteira') || lower.includes('corrida') || lower.includes('caminhada') || lower.includes('run') || lower.includes('treadmill')) return 'mdi-run';
  if (lower.includes('bicicleta') || lower.includes('bike') || lower.includes('cicli')) return 'mdi-bike';
  if (lower.includes('elíptico') || lower.includes('elliptical')) return 'mdi-walk';
  if (lower.includes('escada') || lower.includes('stairs')) return 'mdi-stairs';
  if (lower.includes('corda') || lower.includes('rope')) return 'mdi-jump-rope';
  return 'mdi-heart-pulse';
};
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.border-none {
  border: none !important;
}
.chart-container {
  position: relative;
  background: rgba(255, 255, 255, 0.015);
  border-radius: 12px;
  overflow: visible;
}
.performance-svg-chart {
  display: block;
  width: 100%;
  height: 220px;
  overflow: visible;
}
.chart-dot {
  fill: #2979FF;
  stroke: #1E1E1E;
  stroke-width: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chart-dot:hover, .chart-dot.glowing {
  fill: #00E676;
  r: 7px;
  stroke-width: 2.5px;
}
.svg-tooltip rect {
  filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
}
.bg-accent-light {
  background-color: rgba(41, 121, 255, 0.1) !important;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.italic {
  font-style: italic;
}
</style>
