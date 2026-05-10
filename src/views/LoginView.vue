<template>
  <v-container class="fill-height bg-background d-flex align-center justify-center">
    <v-card class="pa-8 elevation-8 rounded-xl" width="100%" max-width="450" color="surface">
      
      <!-- Cabeçalho -->
      <div class="text-center mb-8">
        <v-icon icon="mdi-dumbbell" size="64" color="primary" class="mb-4"></v-icon>
        <h1 class="text-h4 font-weight-bold text-white mb-2">Gym Track</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ isLogin ? 'Entre na sua conta' : 'Crie sua conta' }}
        </p>
      </div>

      <!-- Formulário -->
      <v-form @submit.prevent="handleSubmit" v-model="isFormValid">
        
        <!-- Campo Nome (Apenas Cadastro) -->
        <v-text-field
          v-if="!isLogin"
          v-model="name"
          label="Nome Completo"
          type="text"
          variant="outlined"
          prepend-inner-icon="mdi-account-outline"
          :rules="[v => !!v || 'Nome é obrigatório']"
          color="primary"
          class="mb-4"
        ></v-text-field>

        <!-- Campo Nome de Usuário (Apenas Cadastro) -->
        <v-text-field
          v-if="!isLogin"
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
          class="mb-4"
        ></v-text-field>

        <!-- Campo E-mail (Apenas Cadastro) -->
        <v-text-field
          v-if="!isLogin"
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
          class="mb-4"
        ></v-text-field>

        <!-- Campo Login (Usuário ou E-mail) -->
        <v-text-field
          v-if="isLogin"
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
          class="mb-4"
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
          class="mb-4"
        ></v-text-field>

        <!-- Campo Confirmar Senha (Apenas Cadastro) -->
        <v-text-field
          v-if="!isLogin"
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
          class="mb-6"
        ></v-text-field>

        <!-- Mensagem de Erro -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-6"
          density="compact"
        >
          {{ error }}
        </v-alert>

        <!-- Botão Principal -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="x-large"
          class="text-body-1 font-weight-bold mb-4 rounded-lg"
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLogin ? 'Entrar' : 'Cadastrar' }}
        </v-btn>

        <!-- Alternar entre Login/Cadastro -->
        <div class="text-center">
          <v-btn
            variant="text"
            color="primary"
            @click="toggleMode"
            :disabled="isLoading"
            class="text-none"
          >
            {{ isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem conta? Entre aqui' }}
          </v-btn>
        </div>
      </v-form>

    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const isLogin = ref(true);
const isFormValid = ref(false);
const name = ref('');
const username = ref('');
const email = ref('');
const identifier = ref('');
const password = ref('');
const verifyPassword = ref('');
const showPassword = ref(false);

const isLoading = computed(() => store.getters['auth/isLoading']);
const error = computed(() => store.getters['auth/error']);

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  store.commit('auth/SET_ERROR', null);
  
  // Limpar campos de cadastro ao alternar
  if (isLogin.value) {
    name.value = '';
    username.value = '';
    verifyPassword.value = '';
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  const action = isLogin.value ? 'auth/login' : 'auth/register';

  // No login, envia o identificador (pode ser o e-mail ou o username).
  // No cadastro, envia email e username separados.
  const payload = isLogin.value 
    ? { identifier: identifier.value, password: password.value }
    : { email: email.value, password: password.value, name: name.value, username: username.value };
  
  try {
    await store.dispatch(action, payload);
    
    // Sucesso! Redireciona para home
    router.push('/');
  } catch (err) {
    // Erro é tratado no Vuex e exibido via computed `error`
  }
};
</script>

<style scoped>
/* Scoped styles para forçar fill height no wrapper caso não pegue */
.fill-height {
  height: 100vh;
}
</style>
