import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
// Previne comportamento indesejado de zoom por duplo clique/toque ou gestos
if (typeof window !== 'undefined') {
  // 1. Previne zoom nativo de duplo clique no desktop e navegadores compatíveis
  window.addEventListener('dblclick', (e) => {
    e.preventDefault();
  }, { passive: false });

  // 2. Previne gestos de pinça (pinch-to-zoom) no Safari iOS
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });
  document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
  });
  document.addEventListener('gestureend', (e) => {
    e.preventDefault();
  });

  // 3. Previne toque com múltiplos dedos (pinch-to-zoom no mobile)
  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // 4. Previne zoom de duplo toque rápido (< 300ms) em áreas que não sejam botões ou inputs
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      const target = e.target;
      const isInteractive = target && target.closest(
        'button, a, input, select, textarea, [role="button"], .v-btn, .v-selection-control, .v-chip, .v-expansion-panel-title, .custom-input-box, .set-check-btn'
      );
      if (!isInteractive) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, { passive: false });

  // 5. Previne zoom acidental com Ctrl + Scroll do mouse no desktop
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
}

const initApp = async () => {
  // Inicializa a autenticação antes de montar o app para o router saber se o usuário está logado
  await store.dispatch('auth/initializeAuth');

  const app = createApp(App)

  app.use(router)
  app.use(store)
  app.use(vuetify)

  app.mount('#app')
}

initApp();
