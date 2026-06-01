<template>
  <v-container class="fill-height login-container d-flex align-start align-sm-center justify-center">
    <!-- Efeitos Visuais de Fundo -->
    <div class="bg-bubble bubble-1"></div>
    <div class="bg-bubble bubble-2"></div>

    <v-card class="pa-4 pa-sm-8 elevation-8 rounded-xl glass-card" width="100%" max-width="450">
      
      <!-- Cabeçalho -->
      <div class="text-center mb-4 mb-sm-8">
        <v-icon icon="mdi-dumbbell" color="primary" class="mb-2 mb-sm-4 gym-icon"></v-icon>
        <h1 class="text-h5 text-sm-h4 font-weight-bold text-white mb-1">Gym Track</h1>
        <p class="text-body-2 text-sm-subtitle-1 text-medium-emphasis">
          {{ subtitleText }}
        </p>
      </div>

      <!-- Formulário -->
      <v-form @submit.prevent="handleSubmit" v-model="isFormValid">
        
        <transition name="fade-slide" mode="out-in">
          <div :key="mode">
            
            <!-- Modo Login -->
            <div v-if="mode === 'login'">
              <v-text-field
                v-model="identifier"
                label="Usuário ou E-mail"
                type="text"
                variant="outlined"
                prepend-inner-icon="mdi-account-circle-outline"
                :rules="[
                  v => !!v || 'Usuário ou e-mail é obrigatório',
                  v => v.length >= 3 || 'Mínimo de 3 caracteres'
                ]"
                color="primary"
                class="mb-3 mb-sm-4"
                autocomplete="username"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[
                  v => !!v || 'Senha é obrigatória', 
                  v => v.length >= 6 || 'Mínimo de 6 caracteres'
                ]"
                color="primary"
                class="mb-1 mb-sm-2"
                autocomplete="current-password"
              ></v-text-field>
              
              <!-- Lembrar-me e Esqueci minha senha -->
              <div class="d-flex align-center justify-space-between mb-3 mb-sm-4">
                <v-checkbox
                  v-model="rememberMe"
                  label="Lembrar-me"
                  hide-details
                  density="compact"
                  color="primary"
                ></v-checkbox>
                
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  class="px-0 text-none"
                  @click="setMode('forgot-password')"
                >
                  Esqueci minha senha
                </v-btn>
              </div>
            </div>

            <!-- Modo Cadastro -->
            <div v-else-if="mode === 'register'">
              <v-text-field
                v-model="name"
                label="Nome Completo"
                type="text"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                :rules="[v => !!v || 'Nome é obrigatório']"
                color="primary"
                class="mb-3 mb-sm-4"
                autocomplete="name"
              ></v-text-field>

              <v-text-field
                v-model="username"
                label="Nome de Usuário"
                type="text"
                variant="outlined"
                prepend-inner-icon="mdi-account-badge-outline"
                :rules="[
                  v => !!v || 'Usuário é obrigatório',
                  v => /^[a-zA-Z0-9_]+$/.test(v) || 'Apenas letras, números e sublinhado (_)',
                  v => v.length >= 3 || 'Mínimo de 3 caracteres'
                ]"
                color="primary"
                class="mb-3 mb-sm-4"
                autocomplete="username"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                :rules="[
                  v => !!v || 'E-mail é obrigatório',
                  v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
                ]"
                color="primary"
                class="mb-3 mb-sm-4"
                autocomplete="email"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[
                  v => !!v || 'Senha é obrigatória', 
                  v => v.length >= 6 || 'Mínimo de 6 caracteres'
                ]"
                color="primary"
                class="mb-1 mb-sm-2"
                autocomplete="new-password"
              ></v-text-field>
              
              <!-- Indicador de força de senha -->
              <div class="mb-3 mb-sm-4 px-1">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption text-medium-emphasis">Força da Senha:</span>
                  <span :class="`text-caption font-weight-bold text-${passwordStrengthColor}`">{{ passwordStrengthText }}</span>
                </div>
                <v-progress-linear
                  :model-value="passwordStrengthScore"
                  :color="passwordStrengthColor"
                  height="4"
                  rounded
                ></v-progress-linear>
              </div>

              <v-text-field
                v-model="verifyPassword"
                label="Confirmar Senha"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-check-outline"
                :rules="[
                  v => !!v || 'Confirmação de senha é obrigatória',
                  v => v === password || 'As senhas não coincidem'
                ]"
                color="primary"
                class="mb-4 mb-sm-6"
                autocomplete="new-password"
              ></v-text-field>
            </div>

            <!-- Modo Esqueci Minha Senha -->
            <div v-else-if="mode === 'forgot-password'">
              <p class="text-body-2 text-medium-emphasis mb-6">
                Digite seu e-mail abaixo. Enviaremos um link de recuperação para você redefinir sua senha.
              </p>
              
              <v-text-field
                v-model="resetEmail"
                label="E-mail de Recuperação"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                :rules="[
                  v => !!v || 'E-mail é obrigatório',
                  v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
                ]"
                color="primary"
                class="mb-4 mb-sm-6"
                autocomplete="email"
              ></v-text-field>
            </div>
            
          </div>
        </transition>

        <!-- Mensagem de Erro -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4 mb-sm-6"
          density="compact"
        >
          {{ error }}
        </v-alert>

        <!-- Mensagem de Sucesso -->
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4 mb-sm-6"
          density="compact"
        >
          {{ successMessage }}
        </v-alert>

        <!-- Botão Principal -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          class="text-body-1 font-weight-bold mb-3 mb-sm-4 rounded-lg"
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
        >
          {{ submitButtonText }}
        </v-btn>


        <!-- Links de navegação adicionais -->
        <div class="text-center">
          <v-btn
            v-if="mode === 'login'"
            variant="text"
            color="primary"
            @click="setMode('register')"
            :disabled="isLoading"
            class="text-none"
          >
            Não tem uma conta? Cadastre-se
          </v-btn>
          
          <v-btn
            v-if="mode === 'register'"
            variant="text"
            color="primary"
            @click="setMode('login')"
            :disabled="isLoading"
            class="text-none"
          >
            Já tem conta? Entre aqui
          </v-btn>
          
          <v-btn
            v-if="mode === 'forgot-password'"
            variant="text"
            color="primary"
            @click="setMode('login')"
            :disabled="isLoading"
            class="text-none"
            prepend-icon="mdi-arrow-left"
          >
            Voltar para o Login
          </v-btn>
        </div>
      </v-form>

    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const mode = ref('login'); // 'login', 'register', 'forgot-password'
const isFormValid = ref(false);
const name = ref('');
const username = ref('');
const email = ref('');
const identifier = ref('');
const password = ref('');
const verifyPassword = ref('');
const resetEmail = ref('');
const showPassword = ref(false);
const successMessage = ref('');
const rememberMe = ref(false);

const isLoading = computed(() => store.getters['auth/isLoading']);
const error = computed(() => store.getters['auth/error']);

const subtitleText = computed(() => {
  if (mode.value === 'login') return 'Entre na sua conta';
  if (mode.value === 'register') return 'Crie sua conta';
  return 'Recupere seu acesso';
});

const submitButtonText = computed(() => {
  if (mode.value === 'login') return 'Entrar';
  if (mode.value === 'register') return 'Cadastrar';
  return 'Enviar E-mail de Recuperação';
});

// Cálculo dinâmico de força da senha
const passwordStrengthScore = computed(() => {
  const p = password.value;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score += 20;
  if (p.length >= 10) score += 20;
  if (/[A-Z]/.test(p)) score += 20;
  if (/[0-9]/.test(p)) score += 20;
  if (/[^A-Za-z0-9]/.test(p)) score += 20;
  return score;
});

const passwordStrengthColor = computed(() => {
  const score = passwordStrengthScore.value;
  if (score <= 40) return 'error';
  if (score <= 80) return 'warning';
  return 'success';
});

const passwordStrengthText = computed(() => {
  const score = passwordStrengthScore.value;
  if (score === 0) return 'Vazia';
  if (score <= 40) return 'Fraca';
  if (score <= 80) return 'Média';
  return 'Forte';
});

const setMode = (newMode) => {
  mode.value = newMode;
  store.commit('auth/SET_ERROR', null);
  successMessage.value = '';
  
  // Limpar campos
  name.value = '';
  username.value = '';
  email.value = '';
  resetEmail.value = '';
  password.value = '';
  verifyPassword.value = '';
};

// Carregar identificador salvo ("Lembrar-me")
onMounted(() => {
  const savedIdentifier = localStorage.getItem('gymtrack_remember_me');
  if (savedIdentifier) {
    identifier.value = savedIdentifier;
    rememberMe.value = true;
  }
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  successMessage.value = '';

  if (mode.value === 'forgot-password') {
    try {
      await store.dispatch('auth/resetPassword', { email: resetEmail.value });
      successMessage.value = 'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.';
      resetEmail.value = '';
    } catch (err) {
      // Erro é tratado no Vuex
    }
    return;
  }

  const action = mode.value === 'login' ? 'auth/login' : 'auth/register';

  const payload = mode.value === 'login'
    ? { identifier: identifier.value, password: password.value }
    : { email: email.value, password: password.value, name: name.value, username: username.value };
  
  try {
    await store.dispatch(action, payload);
    
    if (mode.value === 'login') {
      if (rememberMe.value) {
        localStorage.setItem('gymtrack_remember_me', identifier.value);
      } else {
        localStorage.removeItem('gymtrack_remember_me');
      }
      router.push('/');
    } else {
      // Cadastro feito com sucesso
      const isAuthenticated = store.getters['auth/isAuthenticated'];
      if (isAuthenticated) {
        router.push('/');
      } else {
        // Redireciona automaticamente para a parte de login
        setMode('login');
        successMessage.value = 'Cadastro realizado com sucesso! Faça login para continuar.';
        
        // Preenche o campo de login com o usuário ou email cadastrado
        identifier.value = username.value || email.value;
      }
    }
  } catch (err) {
    // Erro é tratado no Vuex e exibido via computed `error`
  }
};

</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.login-container {
  min-height: 100vh;
  background-color: #121212;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 16px;
  padding-bottom: 16px;
}
@media (min-width: 600px) {
  .login-container {
    padding-top: 32px;
    padding-bottom: 32px;
  }
}

.bg-bubble {
  position: fixed; /* Fica fixo no viewport, cobrindo a tela inteira mesmo com scroll/teclado */
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.15;
  pointer-events: none; /* Garante que as bolhas não interfiram nos cliques/toques dos inputs */
}

.bubble-1 {
  width: 350px;
  height: 350px;
  background-color: #046804; /* Azul neon esportivo */
  top: 10%;
  left: 10%;
  animation: float1 12s ease-in-out infinite;
}

.bubble-2 {
  width: 300px;
  height: 300px;
  background-color: #ffffff; /* Roxo/Rosa energético */
  bottom: 10%;
  right: 10%;
  animation: float2 14s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

@keyframes float2 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(20px) scale(1.05); }
}

.glass-card {
  background: rgba(30, 30, 30, 0.75) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  z-index: 1;
}

.gym-icon {
  font-size: 48px !important;
  animation: pulseIcon 3s ease-in-out infinite;
  display: inline-block;
}
@media (min-width: 600px) {
  .gym-icon {
    font-size: 64px !important;
  }
}

@keyframes pulseIcon {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0px rgba(0, 230, 118, 0));
  }
  50% {
    transform: scale(1.08) rotate(5deg);
    filter: drop-shadow(0 0 15px rgba(0, 230, 118, 0.6));
  }
}

/* Transições animadas */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
