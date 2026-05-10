import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

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
