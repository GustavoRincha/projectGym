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
        <!-- Indicador Deslizante de Vidro -->
        <div class="hotbar-indicator" :style="indicatorStyle" @pointerdown="onDragStart"></div>

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

const navItems = [
  { match: (p) => p === '/' },
  { match: (p) => p.startsWith('/workouts') },
  { match: (p) => p.startsWith('/goals') },
  { match: (p) => p.startsWith('/history') },
  { match: (p) => p.startsWith('/profile') }
];

const activeIndex = computed(() => {
  return navItems.findIndex(item => item.match(route.path));
});

// Estados para arrasto do indicador e exibição temporária
const isDragging = ref(false);
const showIndicator = ref(false);
const dragX = ref(0);
const dragStartPageX = ref(0);
const indicatorStartLeft = ref(0);
const hotbarWidth = ref(0);
const hotbarRef = ref(null);

const indicatorStyle = computed(() => {
  const visible = isDragging.value || showIndicator.value;
  
  if (isDragging.value) {
    const itemWidth = hotbarWidth.value / 5;
    const maxLeft = hotbarWidth.value - itemWidth;
    let leftPx = indicatorStartLeft.value + dragX.value;
    
    // Constraints (limitar o movimento horizontal dentro da hotbar)
    if (leftPx < 0) leftPx = 0;
    if (leftPx > maxLeft) leftPx = maxLeft;
    
    return {
      left: `${leftPx}px`,
      opacity: 1,
      transition: 'none', // Sem transição de mola durante o arrasto
      transform: 'scale(1.08)', // Feedback de que a bolha foi selecionada/flutua
      cursor: 'grabbing'
    };
  } else {
    const index = activeIndex.value;
    if (index === -1) return { opacity: 0 };
    const left = index * 20;
    return {
      left: `${left}%`,
      opacity: visible ? 1 : 0.25, // Mantém 25% de opacidade quando parado para marcar a seleção
      transition: 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, transform 0.3s ease',
      transform: visible ? 'scale(1)' : 'scale(0.96)' // Encolhe levemente para 0.96 quando parado
    };
  }
});

// Monitorar a aba ativa para exibir temporariamente a bolha durante a transição
watch(activeIndex, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    showIndicator.value = true;
    setTimeout(() => {
      if (!isDragging.value) {
        showIndicator.value = false;
      }
    }, 450); // Oculta a bolha após 450ms (término do snap elástico)
  }
});

const onDragStart = (event) => {
  event.preventDefault();
  
  const hotbarEl = event.currentTarget.parentElement;
  if (!hotbarEl) return;
  
  hotbarRef.value = hotbarEl;
  hotbarWidth.value = hotbarEl.clientWidth;
  
  isDragging.value = true;
  showIndicator.value = true;
  dragX.value = 0;
  dragStartPageX.value = event.pageX;
  
  const index = activeIndex.value;
  const itemWidth = hotbarWidth.value / 5;
  indicatorStartLeft.value = index * itemWidth;
  
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
  window.addEventListener('pointercancel', onDragEnd);
};

const onDragMove = (event) => {
  if (!isDragging.value) return;
  dragX.value = event.pageX - dragStartPageX.value;
};

const onDragEnd = () => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
  window.removeEventListener('pointercancel', onDragEnd);
  
  const finalLeft = indicatorStartLeft.value + dragX.value;
  const itemWidth = hotbarWidth.value / 5;
  
  let targetIndex = Math.round(finalLeft / itemWidth);
  if (targetIndex < 0) targetIndex = 0;
  if (targetIndex > 4) targetIndex = 4;
  
  const paths = ['/', '/workouts', '/goals', '/history', '/profile'];
  if (targetIndex !== activeIndex.value) {
    router.push(paths[targetIndex]);
  }
  
  // Mantém a bolha visível durante o snap final e oculta em seguida
  setTimeout(() => {
    if (!isDragging.value) {
      showIndicator.value = false;
    }
  }, 450);
  
  dragX.value = 0;
};

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

  // Exibe o indicador brevemente ao abrir o app para onboarding visual
  if (showBottomNav.value) {
    showIndicator.value = true;
    setTimeout(() => {
      if (!isDragging.value) {
        showIndicator.value = false;
      }
    }, 800);
  }
});

watch(showBottomNav, (newVal) => {
  if (newVal) {
    showIndicator.value = true;
    setTimeout(() => {
      if (!isDragging.value) {
        showIndicator.value = false;
      }
    }, 800);
  }
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
  position: relative; /* Necessário para posicionamento do indicador */
}

.hotbar-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(20% - 6px); /* Aumentado a largura reduzindo as margens laterais para 3px */
  margin: 0 3px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.4),
    inset 0 -1px 3px rgba(0, 0, 0, 0.2);
  z-index: 1;
  transition: left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease; /* Efeito elástico elogiado do iOS */
  touch-action: none; /* Previne scroll nativo no celular ao arrastar a bolha */
  cursor: grab; /* Cursor indicativo de arrastável no computador */
}

/* Reflexo de brilho na bolha de vidro 3D */
.hotbar-indicator::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 10%;
  width: 80%;
  height: 35%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0));
  border-radius: 100px 100px 0 0;
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
  position: relative; /* Necessário para ordem de renderização */
  z-index: 2; /* Renderiza sobre a bolha deslizante */
}

.hotbar-item:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}

.hotbar-item.active {
  color: #FFFFFF !important;
  pointer-events: none; /* Permite que toques/cliques passem para o indicador abaixo e iniciem o arrasto */
}

.hotbar-icon {
  font-size: 22px !important;
  margin-bottom: 2px;
  transition: transform 0.25s ease;
}

.hotbar-item.active .hotbar-icon {
  transform: scale(1.1);
  color: #FFFFFF !important;
}

.hotbar-label {
  font-size: 8.5px; /* Reduzido ligeiramente de 9px para 8.5px para caber perfeitamente na bolha */
  font-weight: 700;
  letter-spacing: 0.2px; /* Reduzido o espaçamento para economizar espaço horizontal */
  text-align: center;
  line-height: 1.2;
  white-space: nowrap; /* Garante que palavras compridas nunca quebrem a linha */
}

/* Ajustes responsivos para telas pequenas de celular (evita cortar ou sobrepor textos) */
@media (max-width: 375px) {
  .hotbar-label {
    font-size: 7.5px;
    letter-spacing: 0px;
  }
  .hotbar-icon {
    font-size: 20px !important;
  }
  .hotbar-indicator {
    width: calc(20% - 4px); /* Menor margem lateral para expandir a bolha em celulares compactos */
    margin: 0 2px;
  }
}
</style>
