<template>
  <div class="streak-panel">
    <!-- Streak Card -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 overflow-hidden">
      <div class="streak-header pa-4 d-flex align-center justify-space-between">
        <div>
          <div class="text-caption text-medium-emphasis mb-1">Sequência Atual</div>
          <div class="text-h3 font-weight-bold">
            {{ streak }} <span class="text-h5">{{ streak > 0 ? '🔥' : '💤' }}</span>
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ streak === 0 ? 'Nenhum treino recente' : streak === 1 ? 'dia seguido' : 'dias seguidos' }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-caption text-medium-emphasis mb-1">Semanas seguidas</div>
          <div class="text-h4 font-weight-bold">{{ weekStreak }} 📅</div>
        </div>
      </div>

      <!-- Mini calendar for the current week -->
      <div class="pa-3">
        <div class="text-caption text-medium-emphasis mb-2">Esta Semana</div>
        <div class="mini-calendar">
          <div
            v-for="day in currentWeekDays"
            :key="day.key"
            class="day-dot"
            :class="{ 'day-dot--active': day.hasSession, 'day-dot--today': day.isToday }"
          >
            <div class="day-label">{{ day.label }}</div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Monthly Challenge -->
    <v-card color="surface" elevation="2" rounded="lg" class="mb-4 pa-4">
      <!-- Header: título e mês -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div>
          <div class="text-subtitle-1 font-weight-bold">🏆 Desafio Mensal</div>
          <div class="text-caption text-medium-emphasis">{{ currentMonthName }}</div>
        </div>
        <v-chip size="small" :color="monthlyProgress >= 100 ? 'success' : 'secondary'" variant="tonal">
          {{ monthlyCount }}/{{ monthlyTarget }}
        </v-chip>
      </div>

      <!-- Barra de progresso -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-body-2 font-weight-bold text-primary">{{ monthlyCount }} de {{ monthlyTarget }} treinos</span>
        <span class="text-caption text-medium-emphasis">{{ monthlyProgress }}%</span>
      </div>
      <v-progress-linear
        :model-value="monthlyProgress"
        :color="monthlyProgress >= 100 ? 'success' : 'secondary'"
        bg-color="background"
        rounded
        height="12"
        class="mb-2"
      ></v-progress-linear>
      <div class="text-caption text-medium-emphasis text-right mb-3">
        {{ monthlyTarget - monthlyCount > 0 ? `Faltam ${monthlyTarget - monthlyCount} treinos` : '✅ Meta Mensal Atingida!' }}
      </div>

      <!-- Editar meta -->
      <v-divider class="mb-3"></v-divider>
      <div class="text-caption text-medium-emphasis mb-2">Alterar meta do mês:</div>
      <v-row dense align="center">
        <v-col>
          <v-text-field
            v-model.number="editableTarget"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            label="Meta de treinos no mês"
          ></v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-btn color="secondary" height="40" min-width="56" @click="saveTarget">OK</v-btn>
        </v-col>
      </v-row>
    </v-card>


    <!-- Accumulated Time -->
    <v-row>
      <v-col cols="6">
        <v-card color="surface" elevation="2" rounded="lg" class="pa-4 text-center">
          <div class="text-caption text-medium-emphasis mb-1">⏱️ Esta Semana</div>
          <div class="text-h5 font-weight-bold text-primary">{{ weeklyTime.hours }}h{{ weeklyTime.mins }}m</div>
          <div class="text-caption text-medium-emphasis">{{ weeklyCount }} treino{{ weeklyCount !== 1 ? 's' : '' }}</div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card color="surface" elevation="2" rounded="lg" class="pa-4 text-center">
          <div class="text-caption text-medium-emphasis mb-1">📅 Este Mês</div>
          <div class="text-h5 font-weight-bold text-secondary">{{ monthlyTime.hours }}h{{ monthlyTime.mins }}m</div>
          <div class="text-caption text-medium-emphasis">{{ monthlyCount }} treino{{ monthlyCount !== 1 ? 's' : '' }}</div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const sessions        = computed(() => store.getters['history/allSessions']);
const monthlyTarget   = computed(() => store.getters['goals/monthlyChallenge'].target);
const editableTarget  = ref(monthlyTarget.value);

// ── Streak calculation ─────────────────────────────────────────────────
const dateKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

const sessionDateSet = computed(() => new Set(sessions.value.map(s => dateKey(s.date))));

const streak = computed(() => {
  const today = new Date();
  const todayKey = dateKey(today);
  const hasTodaySession = sessionDateSet.value.has(todayKey);
  let count = 0;
  for (let i = hasTodaySession ? 0 : 1; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (sessionDateSet.value.has(dateKey(d))) count++;
    else break;
  }
  return count;
});

const weekStreak = computed(() => {
  let count = 0;
  const today = new Date();
  for (let w = 0; w <= 52; w++) {
    // Check if at least one session exists in this week
    let hasSession = false;
    for (let d = 0; d < 7; d++) {
      const day = new Date(today);
      day.setDate(day.getDate() - (w * 7) - d);
      if (sessionDateSet.value.has(dateKey(day))) { hasSession = true; break; }
    }
    if (hasSession) count++;
    else if (w > 0) break; // Allow current week to be in progress
  }
  return count;
});

// ── Mini Calendar ──────────────────────────────────────────────────────
const DAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const currentWeekDays = computed(() => {
  const result = [];
  const today = new Date();
  
  // Encontrar o Domingo desta semana
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    result.push({
      key:        dateKey(d),
      label:      DAYS_SHORT[d.getDay()],
      hasSession: sessionDateSet.value.has(dateKey(d)),
      isToday:    dateKey(d) === dateKey(today),
    });
  }
  return result;
});

// ── Monthly / Weekly stats ─────────────────────────────────────────────
const now = new Date();
const currentMonthName = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

const monthlySessions = computed(() => sessions.value.filter(s => {
  const d = new Date(s.date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}));
const monthlyCount    = computed(() => monthlySessions.value.length);
const monthlyProgress = computed(() => Math.min(100, Math.round((monthlyCount.value / monthlyTarget.value) * 100)));

const weeklySessions = computed(() => {
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return sessions.value.filter(s => new Date(s.date) >= weekStart);
});
const weeklyCount = computed(() => weeklySessions.value.length);

const sumTime = (arr) => {
  const total = arr.reduce((sum, s) => sum + (s.duration || 0), 0);
  return { hours: Math.floor(total / 3600), mins: Math.floor((total % 3600) / 60) };
};
const weeklyTime  = computed(() => sumTime(weeklySessions.value));
const monthlyTime = computed(() => sumTime(monthlySessions.value));

const saveTarget = () => store.dispatch('goals/setMonthlyTarget', editableTarget.value);
</script>

<style scoped>
.streak-header { background: linear-gradient(135deg, #1E1E1E, #2a2a2a); border-bottom: 1px solid rgba(255,255,255,0.07); }
.mini-calendar { display: flex; gap: 4px; }
.day-dot { flex: 1; text-align: center; }
.day-label { font-size: 9px; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
.dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(255,255,255,0.08);
  margin: 0 auto;
}
.day-dot--active .dot { background: #00E676; }
.day-dot--today .day-label { color: #00E676; font-weight: bold; }
</style>
