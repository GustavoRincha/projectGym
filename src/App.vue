<template>
  <v-app>
    <v-app-bar v-if="isAuthenticated" color="background" elevation="0" border>
      <v-app-bar-title class="text-primary font-weight-bold">
        <v-icon icon="mdi-dumbbell" class="mr-2"></v-icon>
        Gym Track
      </v-app-bar-title>
      <v-spacer></v-spacer>
      
      <v-chip v-if="!isOnline" color="error" size="small" variant="flat" prepend-icon="mdi-wifi-strength-off-outline" class="mr-2 font-weight-bold">
        Offline
      </v-chip>

      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container class="pb-16" fluid>
        <!-- Banner de Treino Ativo -->
        <v-alert
          v-if="isSessionActive"
          color="success"
          variant="flat"
          class="mb-4 text-center font-weight-bold"
          rounded="lg"
          elevation="4"
          style="cursor: pointer;"
          @click="returnToSession"
        >
          <div class="d-flex align-center justify-center w-100">
            <v-icon icon="mdi-timer-outline" class="mr-2"></v-icon>
            Treino em Andamento: {{ formattedSessionTime }}
            <v-icon icon="mdi-chevron-right" class="ml-2"></v-icon>
          </div>
        </v-alert>

        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation v-if="showBottomNav" bg-color="surface" color="primary" grow shift app>
      <v-btn to="/" value="home">
        <v-icon>mdi-home</v-icon>
        <span>Início</span>
      </v-btn>

      <v-btn to="/workouts" value="workouts">
        <v-icon>mdi-format-list-bulleted</v-icon>
        <span>Treinos</span>
      </v-btn>

      <v-btn to="/history" value="history">
        <v-icon>mdi-history</v-icon>
        <span>Histórico</span>
      </v-btn>

      <v-btn to="/goals" value="goals">
        <v-icon>mdi-target</v-icon>
        <span>Metas</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { onMounted, onUnmounted, computed, watch, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { syncService } from '@/services/syncService';

const store = useStore();
const router = useRouter();
const route = useRoute();

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const isOnline = ref(navigator.onLine);

const showBottomNav = computed(() => {
  return isAuthenticated.value && !['CreateWorkout', 'EditWorkout'].includes(route.name);
});

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (isOnline.value) {
    // Quando a internet volta, tenta processar a fila
    syncService.processQueue();
  }
};

const fetchAllData = () => {
  if (isAuthenticated.value) {
    store.dispatch('workouts/fetchRoutines');
    store.dispatch('history/fetchHistory');
    store.dispatch('body/fetchBody');
    store.dispatch('goals/fetchGoals');
    store.dispatch('gamification/fetchGamification');
  }
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Tentar processar a fila assim que abre o app (se tiver internet)
  updateOnlineStatus();

  fetchAllData();
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  if (sessionTimer) {
    clearInterval(sessionTimer);
  }
});

watch(isAuthenticated, (newVal) => {
  if (newVal) {
    fetchAllData();
  }
});

// Lógica Global do Treino em Background
const isSessionActive = computed(() => store.getters['session/isActive']);
const sessionTime = computed(() => store.getters['session/elapsedTime']);
const sessionRoutineId = computed(() => store.getters['session/routineId']);

const formattedSessionTime = computed(() => {
  const mins = Math.floor(sessionTime.value / 60);
  const secs = sessionTime.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

let sessionTimer = null;

watch(isSessionActive, (newVal) => {
  if (newVal) {
    if (!sessionTimer) {
      sessionTimer = setInterval(() => {
        store.dispatch('session/updateElapsedTime');
      }, 1000);
    }
  } else {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      sessionTimer = null;
    }
  }
}, { immediate: true });

const returnToSession = () => {
  // Evitar rotear se já estivermos na tela de treino ativo para evitar erro de navegação
  if (sessionRoutineId.value && route.path !== `/workout/${sessionRoutineId.value}`) {
    router.push(`/workout/${sessionRoutineId.value}`);
  }
};

const logout = async () => {
  await store.dispatch('auth/logout');
  router.push('/login');
};
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #121212;
}
/* Ensure the active button in bottom nav has more emphasis */
.v-bottom-navigation .v-btn--active {
  color: #00E676 !important;
}
</style>
