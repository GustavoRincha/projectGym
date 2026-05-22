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

      <!-- <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main class="bg-background">
      <v-container class="main-content-container" fluid>
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

    <!-- Hotbar Glassmórfica Personalizada -->
    <nav v-if="showBottomNav" class="custom-hotbar-container">
      <div class="custom-hotbar">
        <router-link to="/" class="hotbar-item" :class="{ 'active': route.path === '/' }">
          <v-icon class="hotbar-icon">mdi-dumbbell</v-icon>
          <span class="hotbar-label">MEU PLANO</span>
        </router-link>

        <router-link to="/workouts" class="hotbar-item" :class="{ 'active': route.path.startsWith('/workouts') }">
          <v-icon class="hotbar-icon">mdi-view-grid-outline</v-icon>
          <span class="hotbar-label">TREINOS</span>
        </router-link>

        <router-link to="/goals" class="hotbar-item" :class="{ 'active': route.path.startsWith('/goals') }">
          <v-icon class="hotbar-icon">mdi-chart-bar</v-icon>
          <span class="hotbar-label">PROGRESSO</span>
        </router-link>

        <router-link to="/history" class="hotbar-item" :class="{ 'active': route.path.startsWith('/history') }">
          <v-icon class="hotbar-icon">mdi-arm-flex</v-icon>
          <span class="hotbar-label">EXERCÍCIOS</span>
        </router-link>

        <router-link to="/profile" class="hotbar-item" :class="{ 'active': route.path.startsWith('/profile') }">
          <v-icon class="hotbar-icon">mdi-account-outline</v-icon>
          <span class="hotbar-label">PERFIL</span>
        </router-link>
      </div>
    </nav>
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
.main-content-container {
  padding-bottom: 110px !important;
}

/* Custom Hotbar Glassmorphism Styles */
.custom-hotbar-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 580px;
  z-index: 9999;
}

.custom-hotbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(13, 27, 34, 0.85); /* Dark teal-blue glassmorphic background */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 50px;
  border: 1.5px solid rgba(0, 230, 118, 0.12); /* Thin glowing green border */
  padding: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 230, 118, 0.05);
}

.hotbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex: 1;
  height: 56px;
  border-radius: 100px;
  color: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 4px 2px;
}

.hotbar-item:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}

.hotbar-item.active {
  color: #FFFFFF !important;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 4px 10px rgba(0, 0, 0, 0.2);
}

.hotbar-icon {
  font-size: 22px !important;
  margin-bottom: 2px;
  transition: transform 0.25s ease;
}

.hotbar-item.active .hotbar-icon {
  transform: scale(1.05);
  color: #FFFFFF !important;
}

.hotbar-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-align: center;
  line-height: 1.2;
}
</style>
