<template>
  <div class="profile-view pb-16">
    <h1 class="text-h4 font-weight-bold mb-6 mt-4">Perfil</h1>

    <!-- Card Principal do Usuário (Glassmorphic com Banner) -->
    <v-card color="surface" elevation="2" rounded="xl" class="profile-main-card mb-6 overflow-hidden glass-card">
      <!-- Banner de Destaque com Capa Dinâmica -->
      <div class="profile-cover-banner" :style="{ background: coverGradient }">
        <div class="banner-overlay"></div>
      </div>
      
      <div class="px-6 pb-6 pt-0 profile-user-info-section">
        <div class="d-flex align-center flex-column flex-sm-row user-info-row">
          <!-- Avatar Circular Interativo com Anel de Destaque Neon -->
          <div class="avatar-wrapper mb-4 mb-sm-0 mr-sm-6">
            <v-avatar 
              color="primary" 
              size="90" 
              class="avatar-hover profile-avatar" 
              @click="triggerFileInput"
              :style="{ borderColor: primaryColorHex + ' !important' }"
            >
              <!-- Indicador de Upload -->
              <div v-if="uploadLoading" class="d-flex align-center justify-center fill-height w-100 bg-black-light">
                <v-progress-circular indeterminate color="white" size="30" width="3"></v-progress-circular>
              </div>
              
              <template v-else>
                <v-img
                  v-if="userAvatarUrl"
                  :src="userAvatarUrl"
                  alt="Foto de Perfil"
                  cover
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-primary">
                      <v-progress-circular indeterminate color="white" size="20"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                <span v-else class="text-h4 font-weight-black text-background">
                  {{ userInitials }}
                </span>
                
                <!-- Overlay de upload de câmera ao passar o mouse -->
                <div class="avatar-overlay">
                  <v-icon icon="mdi-camera" color="white" size="medium"></v-icon>
                </div>
              </template>
            </v-avatar>
            <!-- Pequeno selo de Nível anexado ao avatar -->
            <div class="avatar-level-badge animate-pulse" :style="{ backgroundColor: primaryColorHex }">
              {{ level.name || '1' }}
            </div>
          </div>

          <!-- Input de Arquivos Oculto -->
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            style="display: none;"
            @change="onFileSelected"
          />
          
          <div class="text-center text-sm-left flex-grow-1 w-100 mt-2 mt-sm-0">
            <div class="d-flex align-center justify-center justify-sm-start flex-wrap" style="gap: 8px;">
              <h2 class="text-h5 font-weight-bold">{{ userName }}</h2>
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="small"
                color="primary"
                class="ml-1"
                @click="openEditProfile"
                title="Editar Perfil"
              ></v-btn>
            </div>
            <p class="text-subtitle-2 text-medium-emphasis mb-2">@{{ userUsername }}</p>
            
            <div class="d-flex align-center justify-center justify-sm-start text-caption text-medium-emphasis mb-3">
              <v-icon icon="mdi-email-outline" size="small" class="mr-1"></v-icon>
              {{ userEmail }}
            </div>

            <!-- Chips de Informações Estendidas -->
            <div class="d-flex align-center justify-center justify-sm-start flex-wrap gap-2">
              <v-chip v-if="userAge !== null" size="small" variant="tonal" class="text-caption font-weight-bold">
                <v-icon icon="mdi-cake-variant-outline" start size="small"></v-icon>
                {{ userAge }} anos
              </v-chip>
              <v-chip v-if="userHeight" size="small" variant="tonal" class="text-caption font-weight-bold">
                <v-icon icon="mdi-ruler" start size="small"></v-icon>
                {{ formatHeight(userHeight) }}
              </v-chip>
              <v-chip v-if="userGoalLabel" size="small" color="primary" variant="flat" class="text-caption font-weight-black">
                <v-icon icon="mdi-target" start size="small"></v-icon>
                {{ userGoalLabel }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Nível e Progressão de XP -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-6 mb-6 glass-card">
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-subtitle-1 font-weight-bold d-flex align-center">
          <span class="mr-2 text-h5">{{ level.icon }}</span> Nível {{ level.name }}
        </span>
        <span class="text-caption font-weight-black text-primary">{{ xp }} XP</span>
      </div>

      <!-- Barra de Progresso Customizada com Efeito de Brilho -->
      <div class="xp-progress-container mb-3">
        <div class="xp-progress-bar" :style="{ width: `${levelProgress}%`, background: `linear-gradient(90deg, ${primaryColorHex} 0%, #00E676 100%)` }"></div>
      </div>

      <div class="d-flex justify-space-between align-center text-caption text-medium-emphasis">
        <span>Próximo nível</span>
        <span v-if="level.nextXp">{{ xpToNextLevel }} XP restante</span>
        <span v-else>Nível Máximo atingido!</span>
      </div>
    </v-card>

    <!-- Progresso Corporal & Medidas Corporais -->
    <v-card class="glass-card pa-6 mb-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h6 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-scale-bathroom" class="mr-2 text-primary"></v-icon>
          Progresso Físico
        </h3>
        <v-btn 
          size="small" 
          variant="flat" 
          color="primary" 
          rounded="pill" 
          prepend-icon="mdi-plus" 
          @click="openQuickLog"
          class="font-weight-bold"
        >
          Registrar
        </v-btn>
      </div>

      <v-row>
        <!-- Peso Atual -->
        <v-col cols="6" sm="4" class="text-center py-2 border-right-divider">
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase d-block mb-1">Peso Atual</span>
          <span class="text-h5 font-weight-black" v-if="currentWeight">{{ currentWeight }} kg</span>
          <span class="text-subtitle-1 text-medium-emphasis" v-else>-- kg</span>
        </v-col>

        <!-- Meta de Peso -->
        <v-col cols="6" sm="4" class="text-center py-2 border-right-divider">
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase d-block mb-1">Meta de Peso</span>
          <span class="text-h5 font-weight-black text-secondary" v-if="targetWeight">{{ targetWeight }} kg</span>
          <span class="text-subtitle-1 text-medium-emphasis" v-else>Não definida</span>
        </v-col>

        <!-- Percentual de Gordura -->
        <v-col cols="12" sm="4" class="text-center py-2 pt-4 pt-sm-2">
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase d-block mb-1">Gordura Corporal</span>
          <span class="text-h5 font-weight-black text-accent" v-if="currentBf">{{ currentBf }}%</span>
          <span class="text-subtitle-1 text-medium-emphasis" v-else>-- %</span>
        </v-col>
      </v-row>

      <!-- Barra de progresso para a meta de peso -->
      <div v-if="weightProgressPercentage !== null" class="mt-4">
        <div class="d-flex justify-space-between align-center mb-1 text-caption">
          <span class="text-medium-emphasis">Progresso da Meta</span>
          <span class="font-weight-bold text-secondary">{{ weightProgressPercentage }}%</span>
        </div>
        <v-progress-linear 
          :model-value="weightProgressPercentage" 
          color="secondary" 
          height="8" 
          rounded 
          striped
          class="progress-glow"
        ></v-progress-linear>
      </div>

      <v-divider class="my-4"></v-divider>
      <div class="d-flex align-center justify-space-between hover-text-primary text-caption font-weight-bold" style="cursor: pointer;" @click="goToGoals">
        <span>Ver gráficos de evolução corporal completa</span>
        <v-icon icon="mdi-chevron-right" size="small"></v-icon>
      </div>
    </v-card>

    <!-- Estatísticas de Treino Aprimoradas -->
    <v-row class="mb-6">
      <v-col cols="6" sm="3">
        <v-card color="surface" elevation="1" rounded="lg" class="pa-4 text-center glass-card stat-card fill-height">
          <v-icon icon="mdi-dumbbell" color="primary" size="large" class="mb-2"></v-icon>
          <span class="text-h5 font-weight-black d-block mb-1">{{ totalWorkouts }}</span>
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">Total Treinos</span>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card color="surface" elevation="1" rounded="lg" class="pa-4 text-center glass-card stat-card fill-height">
          <v-icon icon="mdi-fire" color="secondary" size="large" class="mb-2"></v-icon>
          <span class="text-h5 font-weight-black d-block mb-1">{{ currentStreak }}</span>
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">Dias Seguidos</span>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card color="surface" elevation="1" rounded="lg" class="pa-4 text-center glass-card stat-card fill-height">
          <v-icon icon="mdi-calendar-week" color="accent" size="large" class="mb-2"></v-icon>
          <span class="text-h5 font-weight-black d-block mb-1">{{ averageWeeklyWorkouts }}x</span>
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">Média Semanal</span>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card color="surface" elevation="1" rounded="lg" class="pa-4 text-center glass-card stat-card fill-height">
          <v-icon icon="mdi-clock-check-outline" color="success" size="large" class="mb-2"></v-icon>
          <span class="text-h5 font-weight-black d-block mb-1">{{ totalDurationHours }}h</span>
          <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">Horas Dedicadas</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- Configurações de Notificação -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-6 mb-6 glass-card">
      <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon icon="mdi-bell-outline" class="mr-2 text-primary"></v-icon>
        Notificações
      </h3>
      
      <!-- Lembrete de Treino Switch -->
      <div class="d-flex align-center justify-space-between" :class="{ 'mb-4': notificationsEnabled }">
        <div style="flex: 1; min-width: 0; padding-right: 12px;">
          <span class="text-subtitle-1 font-weight-bold text-high-emphasis d-block leading-tight mb-1">Lembrete de Treino</span>
          <span class="text-caption text-medium-emphasis d-block leading-normal">Notificações se ficar mais de 24h sem treinar</span>
        </div>
        <v-switch
          v-model="notificationsEnabled"
          color="primary"
          hide-details
          inset
          @update:model-value="toggleNotifications"
        ></v-switch>
      </div>

      <v-divider class="mb-4" v-if="notificationsEnabled"></v-divider>

      <!-- Botão de Teste de Notificação -->
      <v-btn
        v-if="notificationsEnabled"
        color="primary"
        variant="tonal"
        size="small"
        rounded="pill"
        prepend-icon="mdi-send-outline"
        @click="testNotification"
        class="font-weight-bold"
      >
        Testar Notificação
      </v-btn>
    </v-card>

    <!-- Personalização de Aparência -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-6 mb-6 glass-card">
      <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon icon="mdi-palette-outline" class="mr-2 text-primary"></v-icon>
        Aparência e Cores
      </h3>
      
      <!-- Tema Escuro Switch -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div style="flex: 1; min-width: 0; padding-right: 12px;">
          <span class="text-subtitle-1 font-weight-bold text-high-emphasis d-block leading-tight mb-1">Tema Escuro</span>
          <span class="text-caption text-medium-emphasis d-block leading-normal">Alternar entre modo escuro e claro</span>
        </div>
        <v-switch
          v-model="darkThemeEnabled"
          color="primary"
          hide-details
          inset
          @update:model-value="toggleDarkTheme"
        ></v-switch>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- Cor de Destaque -->
      <div>
        <span class="text-subtitle-1 font-weight-bold text-high-emphasis d-block leading-tight mb-2">Cor de Destaque</span>
        <div class="d-flex align-center justify-start flex-wrap" style="gap: 12px;">
          <v-btn
            v-for="color in themeColors"
            :key="color.value"
            icon
            :color="color.hex"
            size="small"
            class="theme-color-dot"
            :class="{ 'active': currentThemeColor === color.value }"
            @click="changeThemeColor(color.value, color.hex)"
            :title="color.name"
            elevation="1"
          >
            <v-icon v-if="currentThemeColor === color.value" icon="mdi-check" color="background" size="small"></v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Grid de Constância (Últimos 28 Dias) -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-6 mb-6 glass-card">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h6 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-calendar-check" class="mr-2 text-primary"></v-icon>
          Constância de Treinos
        </h3>
        <span class="text-caption text-medium-emphasis">Últimos 28 dias</span>
      </div>

      <div class="consistency-grid-container">
        <div 
          v-for="(day, index) in consistencyGrid" 
          :key="index"
          class="consistency-day-box"
          :class="{ 'trained': day.trained }"
        >
          <div class="tooltip-content">
            <span class="d-block font-weight-bold mb-1">{{ day.dateString }}</span>
            <span class="text-caption leading-tight text-white">{{ day.trained ? (day.routineName || 'Treino Concluído') : 'Descanso' }}</span>
          </div>
        </div>
      </div>
      
      <div class="d-flex justify-space-between align-center mt-4 text-caption text-medium-emphasis">
        <span>Menos ativo</span>
        <div class="d-flex align-center" style="gap: 6px;">
          <div class="legend-box"></div>
          <div class="legend-box trained" :style="{ background: `linear-gradient(135deg, ${primaryColorHex} 0%, #00b0ff 100%)` }"></div>
        </div>
        <span>Mais ativo</span>
      </div>
    </v-card>

    <!-- Histórico de Treinos Link -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-4 mb-6 hover-card d-flex align-center justify-space-between glass-card" @click="goToHistory">
      <div class="d-flex align-center">
        <v-avatar color="rgba(0, 230, 118, 0.1)" class="mr-3" size="40">
          <v-icon icon="mdi-history" color="primary"></v-icon>
        </v-avatar>
        <div>
          <span class="text-subtitle-1 font-weight-bold text-high-emphasis d-block">Histórico de Treinos</span>
          <span class="text-caption text-medium-emphasis">Veja todos os seus treinos concluídos</span>
        </div>
      </div>
      <v-icon icon="mdi-chevron-right" color="medium-emphasis"></v-icon>
    </v-card>

    <!-- Conquistas e Medalhas -->
    <v-card color="surface" elevation="2" rounded="xl" class="pa-6 mb-6 glass-card">
      <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon icon="mdi-medal-outline" class="mr-2 text-primary"></v-icon>
        Medalhas e Conquistas
      </h3>

      <div v-if="badges.length > 0" class="badges-grid">
        <div 
          v-for="badge in badges" 
          :key="badge.id" 
          class="badge-item"
          :class="{ 'locked': !badge.unlocked }"
          v-ripple
          @click="showBadgeDetails(badge)"
        >
          <div class="badge-icon mb-2">{{ badge.icon }}</div>
          <div class="badge-name text-caption font-weight-bold text-truncate">{{ badge.name }}</div>
          <div class="badge-rarity" :class="badge.rarity">{{ getRarityLabel(badge.rarity) }}</div>
        </div>
      </div>
    </v-card>

    <!-- Botão de Sair -->
    <v-btn
      color="error"
      variant="tonal"
      size="large"
      block
      rounded="pill"
      prepend-icon="mdi-logout"
      @click="logout"
      class="font-weight-bold"
    >
      Sair da Conta
    </v-btn>

    <!-- Dialog de Detalhes da Medalha -->
    <v-dialog v-model="badgeDialog" max-width="320">
      <v-card v-if="selectedBadge" color="surface" class="pa-4 text-center rounded-xl glass-card">
        <div class="text-h2 my-4">{{ selectedBadge.icon }}</div>
        <v-card-title class="text-h6 font-weight-bold pt-0 px-2">{{ selectedBadge.name }}</v-card-title>
        <div class="badge-rarity d-inline-block px-3 py-1 rounded-pill mb-4 text-caption" :class="selectedBadge.rarity" style="margin: 0 auto;">
          {{ getRarityLabel(selectedBadge.rarity) }}
        </div>
        <v-card-text class="text-body-2 text-medium-emphasis px-2 pt-0 mb-4">
          {{ selectedBadge.description }}
        </v-card-text>
        
        <v-alert
          v-if="selectedBadge.unlocked"
          type="success"
          variant="tonal"
          density="compact"
          class="text-caption mb-4"
          rounded="lg"
        >
          Desbloqueada em {{ formatDate(selectedBadge.unlockedAt) }}
        </v-alert>
        <v-alert
          v-else
          type="warning"
          variant="tonal"
          density="compact"
          class="text-caption mb-4"
          rounded="lg"
        >
          Medalha bloqueada
        </v-alert>

        <v-card-actions class="pa-0">
          <v-btn block color="primary" variant="flat" rounded="pill" @click="badgeDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Edição de Perfil Estendido -->
    <v-dialog v-model="editProfileDialog" max-width="400">
      <v-card color="surface" rounded="xl" class="pa-4 glass-card">
        <v-card-title class="text-h6 font-weight-bold pt-2 px-2">Editar Perfil</v-card-title>
        <v-card-text class="px-2 pt-2 pb-0">
          <v-text-field
            v-model="editForm.name"
            label="Nome Completo"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[v => !!v || 'O nome é obrigatório']"
          ></v-text-field>

          <v-text-field
            v-model="editForm.username"
            label="Nome de Usuário"
            variant="outlined"
            density="comfortable"
            prefix="@"
            class="mb-3"
            :rules="[
              v => !!v || 'O usuário é obrigatório',
              v => /^[a-zA-Z0-9_.]+$/.test(v) || 'Apenas letras, números, pontos e underlines são permitidos'
            ]"
          ></v-text-field>

          <v-row class="mb-1">
            <v-col cols="6" class="py-0 pr-1">
              <v-text-field
                v-model="editForm.height"
                label="Altura (ex: 1.75)"
                variant="outlined"
                density="comfortable"
                type="number"
                step="0.01"
                min="0.5"
                max="3"
                suffix="m"
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0 pl-1">
              <v-text-field
                v-model="editForm.birthdate"
                label="Nascimento"
                variant="outlined"
                density="comfortable"
                type="date"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-select
            v-model="editForm.fitnessGoal"
            :items="[
              { title: 'Hipertrofia', value: 'hypertrophy' },
              { title: 'Emagrecimento', value: 'fat_loss' },
              { title: 'Condicionamento', value: 'conditioning' },
              { title: 'Qualidade de Vida', value: 'health' }
            ]"
            item-title="title"
            item-value="value"
            label="Objetivo de Treino"
            variant="outlined"
            density="comfortable"
            class="mb-1"
          ></v-select>

          <div v-if="editError" class="text-caption text-error px-1 mt-1 mb-2">
            <v-icon icon="mdi-alert-circle" size="x-small" class="mr-1"></v-icon>
            {{ editError }}
          </div>
        </v-card-text>
        <v-card-actions class="px-2 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editProfileDialog = false" :disabled="editLoading">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveProfile"
            :loading="editLoading"
            :disabled="!editForm.name || !editForm.username"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Registro Rápido de Peso e Gordura Corporal -->
    <v-dialog v-model="quickLogDialog" max-width="340">
      <v-card color="surface" rounded="xl" class="pa-4 glass-card">
        <v-card-title class="text-h6 font-weight-bold pt-2 px-2 d-flex align-center">
          <v-icon icon="mdi-scale-bathroom" class="mr-2 text-primary" size="small"></v-icon>
          Registrar Peso
        </v-card-title>
        <v-card-text class="px-2 pt-2 pb-0">
          <p class="text-caption text-medium-emphasis mb-4">Insira o peso e BF do dia para atualizar sua evolução.</p>
          
          <v-text-field
            v-model="quickLogForm.weight"
            label="Peso (kg)"
            variant="outlined"
            density="comfortable"
            type="number"
            step="0.1"
            class="mb-3"
            suffix="kg"
            :rules="[v => !!v || 'O peso é obrigatório']"
          ></v-text-field>

          <v-text-field
            v-model="quickLogForm.bf"
            label="Gordura Corporal (BF %)"
            variant="outlined"
            density="comfortable"
            type="number"
            step="0.1"
            class="mb-1"
            suffix="%"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-2 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="quickLogDialog = false" :disabled="quickLogLoading">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveQuickLog"
            :loading="quickLogLoading"
            :disabled="!quickLogForm.weight"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para Feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/plugins/supabase';

const store = useStore();
const router = useRouter();

const badgeDialog = ref(false);
const selectedBadge = ref(null);

// Edit Profile States
const editProfileDialog = ref(false);
const editLoading = ref(false);
const editError = ref('');
const editForm = reactive({ name: '', username: '', height: '', birthdate: '', fitnessGoal: '' });

// Quick Weight / BF Log States
const quickLogDialog = ref(false);
const quickLogLoading = ref(false);
const quickLogForm = reactive({ weight: '', bf: '' });

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const theme = useTheme();
const notificationsEnabled = ref(false);
const darkThemeEnabled = ref(true);
const currentThemeColor = ref('green');

const themeColors = [
  { name: 'Verde', value: 'green', hex: '#00E676' },
  { name: 'Azul', value: 'blue', hex: '#2979FF' },
  { name: 'Roxo', value: 'purple', hex: '#AF52DE' },
  { name: 'Laranja', value: 'orange', hex: '#FF6D00' },
];

onMounted(() => {
  notificationsEnabled.value = notificationService.isEnabled();
  darkThemeEnabled.value = theme.global.name.value === 'gymDark';
  currentThemeColor.value = localStorage.getItem('gym_theme_color_key') || 'green';
});

const toggleDarkTheme = (val) => {
  const newTheme = val ? 'gymDark' : 'gymLight';
  theme.global.name.value = newTheme;
  localStorage.setItem('gym_theme_name', newTheme);
  darkThemeEnabled.value = val;
  showMessage(`Tema ${val ? 'Escuro' : 'Claro'} ativado!`, 'success');
};

const changeThemeColor = (key, hex) => {
  currentThemeColor.value = key;
  localStorage.setItem('gym_theme_color_key', key);
  localStorage.setItem('gym_theme_primary_color', hex);
  
  theme.themes.value.gymDark.colors.primary = hex;
  theme.themes.value.gymLight.colors.primary = hex;
  
  const colorNames = { green: 'Verde', blue: 'Azul', purple: 'Roxo', orange: 'Laranja' };
  showMessage(`Cor tema alterada para ${colorNames[key]}!`, 'success');
};

const toggleNotifications = async (val) => {
  if (val) {
    if (!('Notification' in window)) {
      showMessage('Notificações não são suportadas neste navegador.', 'error');
      notificationsEnabled.value = false;
      localStorage.setItem('gym_notifications_enabled', 'false');
      return;
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        notificationsEnabled.value = true;
        localStorage.setItem('gym_notifications_enabled', 'true');
        showMessage('Notificações ativadas com sucesso!', 'success');
        notificationService.sendNotification(
          'Gym Track 🦾',
          'Tudo pronto! Você receberá lembretes por aqui quando passar de 24h sem treinar.'
        );
      } else {
        notificationsEnabled.value = false;
        localStorage.setItem('gym_notifications_enabled', 'false');
        showMessage('Permissão de notificação negada.', 'warning');
      }
    } else if (Notification.permission === 'denied') {
      notificationsEnabled.value = false;
      localStorage.setItem('gym_notifications_enabled', 'false');
      showMessage('As notificações estão bloqueadas no seu navegador. Ative nas configurações do site.', 'warning');
    } else {
      notificationsEnabled.value = true;
      localStorage.setItem('gym_notifications_enabled', 'true');
      showMessage('Notificações ativadas!', 'success');
    }
  } else {
    notificationsEnabled.value = false;
    localStorage.setItem('gym_notifications_enabled', 'false');
    showMessage('Lembretes de treino desativados.', 'info');
  }
};

const testNotification = () => {
  notificationService.sendTestNotification();
  showMessage('Notificação de teste disparada!', 'success');
};

const uploadLoading = ref(false);
const fileInput = ref(null);

const triggerFileInput = () => {
  if (uploadLoading.value) return;
  fileInput.value.click();
};

const onFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showMessage('Por favor, selecione uma imagem válida (JPEG/PNG).', 'error');
    return;
  }

  // Limite de 5MB
  if (file.size > 5 * 1024 * 1024) {
    showMessage('A imagem deve ter no máximo 5MB.', 'error');
    return;
  }

  uploadLoading.value = true;
  try {
    const userId = user.value?.id;
    if (!userId) throw new Error('Usuário não autenticado.');

    // Upload para o Supabase Storage bucket 'avatars'
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Erro no upload do Supabase Storage:', uploadError);
      throw new Error('Falha ao enviar arquivo. Certifique-se de que o bucket "avatars" existe e é público no Supabase.');
    }

    // Obter a URL pública do avatar
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Salvar nos metadados do usuário logado
    await store.dispatch('auth/updateProfilePicture', publicUrl);
    
    showMessage('Foto de perfil atualizada com sucesso!', 'success');
  } catch (err) {
    console.error('Erro geral no upload da foto:', err);
    showMessage(err.message || 'Erro ao fazer upload da imagem.', 'error');
  } finally {
    uploadLoading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const showMessage = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const openEditProfile = () => {
  editForm.name = userName.value;
  editForm.username = userUsername.value;
  editForm.height = userHeight.value ? String(userHeight.value) : '';
  editForm.birthdate = userBirthdate.value || '';
  editForm.fitnessGoal = userFitnessGoal.value || '';
  editError.value = '';
  editProfileDialog.value = true;
};

const saveProfile = async () => {
  if (!editForm.name.trim() || !editForm.username.trim()) return;

  if (!/^[a-zA-Z0-9_.]+$/.test(editForm.username)) {
    editError.value = 'Nome de usuário inválido. Use apenas letras, números, pontos e underlines.';
    return;
  }

  editLoading.value = true;
  editError.value = '';

  try {
    await store.dispatch('auth/updateProfile', {
      name: editForm.name.trim(),
      username: editForm.username.trim().toLowerCase(),
      height: editForm.height ? parseFloat(editForm.height) : null,
      birthdate: editForm.birthdate || null,
      fitnessGoal: editForm.fitnessGoal || null
    });
    
    editProfileDialog.value = false;
    showMessage('Perfil atualizado com sucesso!', 'success');
  } catch (err) {
    console.error('Error saving profile:', err);
    editError.value = err.message || 'Erro ao atualizar o perfil. Tente novamente.';
  } finally {
    editLoading.value = false;
  }
};

const goToHistory = () => {
  router.push('/history');
};

const goToGoals = () => {
  router.push('/goals');
};

const openQuickLog = () => {
  quickLogForm.weight = currentWeight.value ? String(currentWeight.value) : '';
  quickLogForm.bf = currentBf.value ? String(currentBf.value) : '';
  quickLogDialog.value = true;
};

const saveQuickLog = async () => {
  if (!quickLogForm.weight.trim()) return;
  quickLogLoading.value = true;
  try {
    const today = new Date().toISOString();
    await store.dispatch('body/logWeight', { date: today, value: parseFloat(quickLogForm.weight) });
    if (quickLogForm.bf.trim()) {
      await store.dispatch('body/logBf', { date: today, value: parseFloat(quickLogForm.bf) });
    }
    quickLogDialog.value = false;
    showMessage('Medidas salvas com sucesso!', 'success');
  } catch (err) {
    console.error('Error saving quick log:', err);
    showMessage('Erro ao salvar medidas. Tente novamente.', 'error');
  } finally {
    quickLogLoading.value = false;
  }
};

const formatHeight = (height) => {
  if (!height) return '';
  const num = parseFloat(height);
  if (num > 3) {
    return `${(num / 100).toFixed(2)}m`;
  }
  return `${num.toFixed(2)}m`;
};

const user = computed(() => store.getters['auth/user']);
const userAvatarUrl = computed(() => user.value?.user_metadata?.avatar_url || '');
const xp = computed(() => store.getters['gamification/xp']);
const level = computed(() => store.getters['gamification/level']);
const levelProgress = computed(() => store.getters['gamification/levelProgress']);
const xpToNextLevel = computed(() => store.getters['gamification/xpToNextLevel']);
const badges = computed(() => store.getters['gamification/allBadges']);
const sessions = computed(() => store.getters['history/allSessions'] || []);

// Medidas Corporais
const lastWeight = computed(() => store.getters['body/lastWeight']);
const lastBf = computed(() => store.getters['body/lastBf']);
const bodyGoals = computed(() => store.getters['body/goals']);
const currentWeight = computed(() => lastWeight.value ? lastWeight.value.value : null);
const currentBf = computed(() => lastBf.value ? lastBf.value.value : null);
const targetWeight = computed(() => bodyGoals.value ? bodyGoals.value.targetWeight : null);

const weightLog = computed(() => store.getters['body/weightLog'] || []);
const weightProgressPercentage = computed(() => {
  const wCurrent = currentWeight.value;
  const wTarget = targetWeight.value;
  if (!wCurrent || !wTarget || weightLog.value.length < 2) return null;
  const wStart = weightLog.value[0].value;
  
  if (wStart === wTarget) return 100;
  
  const type = bodyGoals.value?.weightGoalType || 'lose';
  let percentage = 0;
  if (type === 'lose') {
    percentage = ((wStart - wCurrent) / (wStart - wTarget)) * 100;
  } else {
    percentage = ((wCurrent - wStart) / (wTarget - wStart)) * 100;
  }
  
  return Math.min(Math.max(Math.round(percentage), 0), 100);
});

// Estatísticas de treino calculadas
const totalDurationHours = computed(() => {
  if (sessions.value.length === 0) return '0.0';
  const totalSeconds = sessions.value.reduce((acc, s) => acc + (s.duration || 0), 0);
  return (totalSeconds / 3600).toFixed(1);
});

const averageWeeklyWorkouts = computed(() => {
  if (sessions.value.length === 0) return '0.0';
  const today = new Date();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(today.getDate() - 28);
  
  const recentSessions = sessions.value.filter(s => {
    const sDate = new Date(s.date);
    return sDate >= fourWeeksAgo && sDate <= today;
  });
  
  return (recentSessions.length / 4).toFixed(1);
});

// Metadados Estendidos
const userBirthdate = computed(() => user.value?.user_metadata?.birthdate || '');
const userHeight = computed(() => user.value?.user_metadata?.height || null);
const userFitnessGoal = computed(() => user.value?.user_metadata?.fitnessGoal || '');

const userAge = computed(() => {
  if (!userBirthdate.value) return null;
  const birth = new Date(userBirthdate.value);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

const userGoalLabel = computed(() => {
  const goalsMap = {
    hypertrophy: 'Hipertrofia',
    fat_loss: 'Emagrecimento',
    conditioning: 'Condicionamento',
    health: 'Qualidade de Vida'
  };
  return goalsMap[userFitnessGoal.value] || '';
});

const primaryColorHex = computed(() => {
  const colorObj = themeColors.find(c => c.value === currentThemeColor.value);
  return colorObj ? colorObj.hex : '#00E676';
});

const coverGradient = computed(() => {
  const hex = primaryColorHex.value;
  return `linear-gradient(135deg, ${hex} 0%, rgba(13, 27, 34, 0.9) 100%)`;
});

const consistencyGrid = computed(() => {
  const cells = [];
  const today = new Date();
  
  const sessionDates = new Set(sessions.value.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }));
  
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    
    const trainedSession = sessions.value.find(s => {
      const sd = new Date(s.date);
      const skey = `${sd.getFullYear()}-${String(sd.getMonth()+1).padStart(2,'0')}-${String(sd.getDate()).padStart(2,'0')}`;
      return skey === dateKey;
    });
    
    cells.push({
      date: d,
      dateString: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      trained: sessionDates.has(dateKey),
      routineName: trainedSession ? trainedSession.routineName : null
    });
  }
  
  return cells;
});

const userName = computed(() => user.value?.user_metadata?.name || 'Usuário');
const userUsername = computed(() => user.value?.user_metadata?.username || 'usuario');
const userEmail = computed(() => user.value?.email || 'email@example.com');

const userInitials = computed(() => {
  const name = userName.value;
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
});

const totalWorkouts = computed(() => sessions.value.length);

const routines = computed(() => store.getters['workouts/allRoutines'] || []);

const getScheduledDaysOfWeek = computed(() => {
  const scheduled = new Set();
  routines.value.forEach(r => {
    if (r.daysOfWeek && Array.isArray(r.daysOfWeek)) {
      r.daysOfWeek.forEach(d => scheduled.add(d));
    }
  });
  return scheduled;
});

const currentStreak = computed(() => {
  if (sessions.value.length === 0) return 0;
  
  const sessionDateSet = new Set(sessions.value.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }));
  
  const scheduledDays = getScheduledDaysOfWeek.value;
  const hasSchedule = scheduledDays.size > 0;
  
  let streak = 0;
  const today = new Date();
  let hasTrainedInStreak = false;
  
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday...
    
    const trained = sessionDateSet.has(key);
    
    if (trained) {
      streak += 1;
      hasTrainedInStreak = true;
    } else {
      if (i === 0) {
        // Se hoje for dia de descanso ou treino e ainda não treinou, não quebra a sequência (dia não acabou)
        continue;
      }
      
      const isRestDay = hasSchedule && !scheduledDays.has(dayOfWeek);
      if (isRestDay) {
        // Dia de descanso: apenas pula sem quebrar a sequência e sem somar ao streak
        continue;
      } else {
        // Dia de treino obrigatório que o usuário perdeu: quebra o streak!
        break;
      }
    }
  }
  
  if (!hasTrainedInStreak) return 0;
  return streak;
});

const getRarityLabel = (rarity) => {
  const labels = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Lendária'
  };
  return labels[rarity] || 'Comum';
};

const showBadgeDetails = (badge) => {
  selectedBadge.value = badge;
  badgeDialog.value = true;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const logout = async () => {
  await store.dispatch('auth/logout');
  router.push('/login');
};
</script>

<style scoped>
/* Glassmorphism Styles */
.glass-card {
  background: rgba(30, 30, 30, 0.65) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25) !important;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease;
}

.v-theme--gymLight .glass-card {
  background: rgba(255, 255, 255, 0.75) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05) !important;
}

/* User Profile Header Card */
.profile-main-card {
  position: relative;
}

.profile-cover-banner {
  height: 120px;
  width: 100%;
  position: relative;
  transition: background 0.4s ease;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 20%, rgba(18, 18, 18, 0.75) 100%);
}

.v-theme--gymLight .banner-overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 20%, rgba(244, 246, 249, 0.75) 100%);
}

.profile-user-info-section {
  position: relative;
  margin-top: -45px;
  z-index: 2;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 3px solid;
  transition: border-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.profile-avatar:hover {
  transform: scale(1.03);
}

.avatar-level-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1e1e1e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  z-index: 3;
}

.v-theme--gymLight .avatar-level-badge {
  border-color: #fff;
}

/* Pulsation animation for Level Badge */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.6);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--v-theme-primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Weight goal progress bar */
.progress-glow {
  box-shadow: 0 0 8px rgba(var(--v-theme-secondary), 0.2);
}

/* Dividers and Columns */
.border-right-divider {
  position: relative;
}

@media (min-width: 600px) {
  .border-right-divider::after {
    content: "";
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background-color: rgba(255, 255, 255, 0.08);
  }
  .v-theme--gymLight .border-right-divider::after {
    background-color: rgba(0, 0, 0, 0.06);
  }
}

.gap-2 {
  gap: 8px;
}

/* Stats Card Styles */
.stat-card {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.hover-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-2px);
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 8px 20px rgba(0, 230, 118, 0.06) !important;
}

.xp-progress-container {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.xp-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px 12px;
  justify-content: center;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.badge-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.06);
}

.badge-item.locked {
  opacity: 0.35;
  filter: grayscale(80%);
}

.badge-icon {
  font-size: 32px;
  line-height: 1;
}

.badge-name {
  width: 100%;
  font-size: 10px !important;
  color: #FFFFFF;
  margin-bottom: 2px;
}

.badge-rarity {
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 4px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

.badge-rarity.common {
  background-color: rgba(142, 142, 147, 0.15);
  color: #8E8E93;
}

.badge-rarity.rare {
  background-color: rgba(0, 122, 255, 0.15);
  color: #007AFF;
}

.badge-rarity.epic {
  background-color: rgba(175, 82, 222, 0.15);
  color: #AF52DE;
}

.badge-rarity.legendary {
  background-color: rgba(255, 149, 0, 0.15);
  color: #FF9500;
}

.consistency-grid-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  justify-items: center;
}

.consistency-day-box {
  width: 100%;
  aspect-ratio: 1;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.02);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.consistency-day-box:hover {
  transform: scale(1.1);
  z-index: 10;
  border-color: rgba(255, 255, 255, 0.2);
}

.consistency-day-box.trained {
  background: linear-gradient(135deg, #00E676 0%, #00b0ff 100%);
  box-shadow: 0 0 10px rgba(0, 230, 118, 0.3);
  border-color: rgba(0, 230, 118, 0.5);
}

/* Tooltip */
.consistency-day-box .tooltip-content {
  visibility: hidden;
  width: 120px;
  background-color: rgba(13, 27, 34, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 6px;
  position: absolute;
  z-index: 20;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  font-size: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.consistency-day-box .tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(13, 27, 34, 0.95) transparent transparent transparent;
}

.consistency-day-box:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}

.legend-box {
  width: 12px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.legend-box.trained {
  box-shadow: 0 0 5px rgba(0, 230, 118, 0.3);
}

.avatar-hover {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-hover:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 2;
}

.bg-black-light {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.theme-color-dot {
  border: 2px solid transparent !important;
  transition: all 0.2s ease;
}

.theme-color-dot.active {
  border-color: #ffffff !important;
  transform: scale(1.15);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
}
</style>
