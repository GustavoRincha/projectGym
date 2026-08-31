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

    <!-- Hotbar Personalizada -->
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

        <router-link to="/exercises" class="hotbar-item" :class="{ 'active': route.path.startsWith('/exercises') }">
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
import { useTheme } from 'vuetify';
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

const theme = useTheme();

onMounted(() => {
  // Aplicar cor tema salva
  const savedColor = localStorage.getItem('gym_theme_primary_color');
  if (savedColor) {
    try {
      theme.themes.value.gymDark.colors.primary = savedColor;
      theme.themes.value.gymLight.colors.primary = savedColor;
    } catch (e) {
      console.error('Erro ao carregar cor tema salva:', e);
    }
  }

  // Aplicar tema escuro/claro salvo
  const savedTheme = localStorage.getItem('gym_theme_name');
  if (savedTheme) {
    try {
      theme.global.name.value = savedTheme;
    } catch (e) {
      console.error('Erro ao carregar tema salvo:', e);
    }
  }

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


/*
const logout = async () => {
  await store.dispatch('auth/logout');
  router.push('/login');
};
*/
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.main-content-container {
  padding-bottom: 110px !important;
}

/* Custom Hotbar Styles */
.custom-hotbar-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 500px;
  z-index: 98;
}

.custom-hotbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(13, 27, 34, 0.9); /* Premium dark teal-blue glassmorphic background */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.hotbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex: 1;
  height: 52px;
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.5) !important;
  transition: all 0.2s ease;
  padding: 4px 2px;
  position: relative;
}

.hotbar-item:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.hotbar-item.active {
  color: rgb(var(--v-theme-primary)) !important;
}

.hotbar-icon {
  font-size: 20px !important;
  margin-bottom: 2px;
  transition: transform 0.2s ease;
}

.hotbar-item.active .hotbar-icon {
  transform: translateY(-2px);
  color: rgb(var(--v-theme-primary)) !important;
}

.hotbar-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1px;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  transition: transform 0.2s ease;
}

.hotbar-item.active .hotbar-label {
  transform: translateY(-2px);
}

/* Subtle dot indicator below active item */
.hotbar-item.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 8px rgb(var(--v-theme-primary));
}

/* Ajustes responsivos para telas pequenas de celular */
@media (max-width: 375px) {
  .hotbar-label {
    font-size: 8px;
  }
  .hotbar-icon {
    font-size: 18px !important;
  }
}

/* Ajustes de design para o Modo Claro */
.v-theme--gymLight .custom-hotbar {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
}

.v-theme--gymLight .hotbar-item {
  color: rgba(0, 0, 0, 0.45) !important;
}

.v-theme--gymLight .hotbar-item:hover {
  color: rgba(0, 0, 0, 0.7) !important;
}

.v-theme--gymLight .hotbar-item.active {
  color: rgb(var(--v-theme-primary)) !important;
}

.v-theme--gymLight .hotbar-icon {
  color: inherit !important;
}

.v-theme--gymLight .hotbar-item.active .hotbar-icon {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
