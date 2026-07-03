<template>
  <div class="home-view">
    <v-row class="mt-4">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold mb-2">Pronto para treinar?</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Vamos atingir suas metas hoje.</p>
      </v-col>
    </v-row>

    <!-- Frequência de Treinos Minimalista -->
    <v-row class="mt-0 mb-6 justify-center">
      <div class="d-flex align-center" style="gap: 6px;">
        <div 
          v-for="(day, idx) in weekDays" 
          :key="idx"
          :class="[
            'week-day-circle',
            day.hasTrained ? 'trained' : '',
            day.isToday ? 'today' : ''
          ]"
          :title="day.label"
        >
          {{ day.char }}
        </div>
        
        <v-chip
          v-if="currentStreak > 0"
          size="small"
          color="secondary"
          variant="flat"
          class="ml-2 font-weight-bold"
          style="height: 26px; padding: 0 8px;"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-fire" size="small" class="mr-0.5"></v-icon>
          </template>
          {{ currentStreak }}d
        </v-chip>
      </div>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card color="surface" elevation="2" rounded="xl" class="pa-5 border border-primary">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-h6 font-weight-bold text-primary d-flex align-center">
              <v-icon icon="mdi-calendar-star" class="mr-2"></v-icon> Treino do Dia
            </span>
          </div>
          
          <div v-if="suggestedRoutine">
            <h2 class="text-h5 font-weight-bold mb-1">{{ suggestedRoutine.name }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ suggestedRoutine.exercises?.length || 0 }} exercícios programados
            </p>
            <v-btn color="primary" block size="large" rounded="pill" @click="startWorkout(suggestedRoutine.id)">
              Iniciar Treino
            </v-btn>
          </div>
          <div v-else class="text-center py-2">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Nenhum treino cadastrado para hoje.
            </p>
            <v-btn color="primary" block size="large" rounded="pill" to="/workouts">
              Criar ou Agendar Treino
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6" v-if="routines.length > 0">
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold mb-3 text-medium-emphasis">Ou escolha outro da sua rotina:</h3>
        <v-row dense>
          <v-col cols="12" sm="6" md="4" v-for="routine in routines" :key="routine.id">
            <v-card 
              color="surface" 
              elevation="1" 
              rounded="lg" 
              @click="startWorkout(routine.id)" 
              class="text-left pa-4 h-100 d-flex align-center justify-between hover-card"
            >
              <div class="flex-grow-1">
                <span class="text-body-1 font-weight-bold d-block">{{ routine.name }}</span>
                <span class="text-caption text-medium-emphasis">{{ routine.exercises?.length || 0 }} exs</span>
              </div>
              <v-icon icon="mdi-chevron-right" color="medium-emphasis"></v-icon>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    
    <v-row class="mt-6" v-if="lastSession">
      <v-col cols="12">
        <v-card 
          color="surface" 
          elevation="3" 
          rounded="xl" 
          class="pa-5 last-session-card position-relative overflow-hidden"
          @click="goToHistory"
        >
          <!-- Background sutil decorativo -->
          <div class="card-gradient-bg"></div>

          <div class="d-flex align-center justify-space-between mb-3 position-relative" style="z-index: 1;">
            <div class="d-flex align-center">
              <v-chip size="x-small" color="secondary" variant="flat" class="font-weight-black text-uppercase tracking-wider px-2">
                Último Treino
              </v-chip>
              <span class="text-caption text-medium-emphasis ml-2 font-weight-bold">
                {{ formatSessionDate(lastSession.date) }}
              </span>
            </div>
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-share-variant-outline"
                variant="text"
                size="small"
                color="primary"
                class="mr-1"
                @click.stop="shareSession(lastSession)"
                title="Compartilhar Treino"
              ></v-btn>
              <v-icon icon="mdi-check-decagram" color="success" size="small"></v-icon>
            </div>
          </div>

          <h3 class="text-h6 font-weight-black mb-3 text-high-emphasis position-relative" style="z-index: 1;">
            {{ lastSession.routineName }}
          </h3>

          <div class="d-flex align-center flex-wrap gap-4 position-relative" style="gap: 16px; z-index: 1;">
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-clock-outline" size="small" color="primary" class="mr-1"></v-icon>
              <span class="font-weight-medium text-high-emphasis">{{ formatDuration(lastSession.duration) }}</span>
            </div>
            
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-dumbbell" size="small" color="secondary" class="mr-1"></v-icon>
              <span class="font-weight-medium text-high-emphasis">{{ lastSessionExerciseCount }} Exercícios</span>
            </div>

            <v-spacer class="hidden-xs-only"></v-spacer>

            <div class="d-flex align-center text-caption text-primary font-weight-bold ml-auto cursor-pointer">
              Ver histórico
              <v-icon icon="mdi-chevron-right" size="small" class="ml-0.5"></v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Overlay de Carregamento para Compartilhamento -->
    <v-overlay
      v-model="shareLoading"
      class="align-center justify-center"
      contained
      persistent
      scrim="rgba(0, 0, 0, 0.7)"
    >
      <div class="text-center pa-6 bg-surface border border-light-trans rounded-xl shadow-lg" style="max-width: 280px;">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          width="4"
          class="mb-4"
        ></v-progress-circular>
        <h4 class="text-subtitle-1 font-weight-bold text-high-emphasis mb-1">Gerando Imagem</h4>
        <p class="text-caption text-medium-emphasis mb-0">Preparando seu card de treino para Stories...</p>
      </div>
    </v-overlay>

    <!-- Dialog de Visualização Prévia do Card de Compartilhamento -->
    <v-dialog v-model="showPreviewDialog" max-width="360" scrollable>
      <v-card color="surface" rounded="xl" class="pa-4 glass-card" v-if="sharingSession">
        <v-card-title class="text-subtitle-1 font-weight-bold pt-2 px-2 d-flex align-center justify-space-between">
          <span class="d-flex align-center">
            <v-icon icon="mdi-eye-outline" class="mr-2 text-primary" size="small"></v-icon>
            Visualizar Card
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showPreviewDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="px-2 py-3 text-center d-flex flex-column align-center">
          <!-- Carrossel de Opções -->
          <div class="d-flex align-center justify-space-between w-100 mb-4 px-2">
            <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="prevTemplate"></v-btn>
            <span class="text-caption font-weight-black text-uppercase tracking-wider text-primary">{{ activeTemplateName }}</span>
            <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="nextTemplate"></v-btn>
          </div>
          
          <!-- Visualização Prévia Escalada (CSS Live Preview) -->
          <div class="preview-image-container mx-auto mb-2">
            <div :class="['share-card-inner', activeTemplate, 'preview-scaled']">
              <!-- Logo / App Name -->
              <div class="share-card-header">
                <v-icon icon="mdi-dumbbell" class="share-logo-icon mr-2"></v-icon>
                <span class="share-logo-text">GYM TRACK</span>
              </div>
              
              <!-- Main Stats -->
              <div class="share-card-content">
                <div class="share-workout-date">{{ formatShareDate(sharingSession.date) }}</div>
                <h2 class="share-workout-title">{{ sharingSession.routineName }}</h2>
                
                <div class="share-divider"></div>
                
                <div class="share-stats-grid">
                  <div class="share-stat-box">
                    <span class="share-stat-val">{{ formatDuration(sharingSession.duration) }}</span>
                    <span class="share-stat-lbl">Tempo de Treino</span>
                  </div>
                  <div class="share-stat-box">
                    <span class="share-stat-val">{{ getSessionExercises(sharingSession).length }}</span>
                    <span class="share-stat-lbl">Exercícios Feitos</span>
                  </div>
                </div>
                
                <div class="share-divider"></div>
                
                <!-- Exercises List -->
                <div v-if="activeTemplate !== 'theme-minimal-metrics'">
                  <div class="share-exercises-title">Exercícios Concluídos</div>
                  <div class="share-exercises-list">
                    <div v-for="ex in getSessionExercises(sharingSession).slice(0, 6)" :key="ex.id" class="share-exercise-item">
                      <v-icon icon="mdi-check-circle-outline" class="share-check-icon mr-3"></v-icon>
                      <span class="share-exercise-name">{{ ex.name }}</span>
                    </div>
                    <div v-if="sharingSession && getSessionExercises(sharingSession).length > 6" class="share-exercise-more">
                      + {{ getSessionExercises(sharingSession).length - 6 }} outros exercícios completados
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Motivational Footer -->
              <div class="share-card-footer">
                <!-- <p class="share-quote">"Consistência supera intensidade."</p>
                <span class="share-app-url">gymtrack.vercel.app</span> -->
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-2 pb-2 flex-column" style="gap: 8px;">
          <v-btn
            color="primary"
            variant="flat"
            block
            rounded="pill"
            prepend-icon="mdi-share-variant"
            @click="executeShare"
            class="font-weight-bold"
          >
            Compartilhar
          </v-btn>
          <v-btn
            variant="text"
            block
            rounded="pill"
            @click="showPreviewDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Container invisível para geração da imagem do card de compartilhamento -->
    <div v-if="sharingSession" :class="['share-card-container-offscreen', activeTemplate]" ref="shareCardRef">
      <div class="share-card-inner">
        <!-- Logo / App Name -->
        <div class="share-card-header">
          <v-icon icon="mdi-dumbbell" class="share-logo-icon mr-2"></v-icon>
          <span class="share-logo-text">GYM TRACK</span>
        </div>
        
        <!-- Main Stats -->
        <div class="share-card-content">
          <div class="share-workout-date">{{ formatShareDate(sharingSession.date) }}</div>
          <h2 class="share-workout-title">{{ sharingSession.routineName }}</h2>
          
          <div class="share-divider"></div>
          
          <div class="share-stats-grid">
            <div class="share-stat-box">
              <span class="share-stat-val">{{ formatDuration(sharingSession.duration) }}</span>
              <span class="share-stat-lbl">Tempo de Treino</span>
            </div>
            <div class="share-stat-box">
              <span class="share-stat-val">{{ getSessionExercises(sharingSession).length }}</span>
              <span class="share-stat-lbl">Exercícios Feitos</span>
            </div>
          </div>
          
          <div class="share-divider"></div>
          
          <!-- Exercises List (Membros Ativos / Principais) -->
          <div v-if="activeTemplate !== 'theme-minimal-metrics'">
            <div class="share-exercises-title">Exercícios Concluídos</div>
            <div class="share-exercises-list">
              <div v-for="ex in getSessionExercises(sharingSession).slice(0, 6)" :key="ex.id" class="share-exercise-item">
                <v-icon icon="mdi-check-circle-outline" class="share-check-icon mr-3"></v-icon>
                <span class="share-exercise-name">{{ ex.name }}</span>
              </div>
              <div v-if="sharingSession && getSessionExercises(sharingSession).length > 6" class="share-exercise-more">
                + {{ getSessionExercises(sharingSession).length - 6 }} outros exercícios completados
              </div>
            </div>
          </div>
        </div>
        
        <!-- Motivational Footer -->
        <div class="share-card-footer">
          <!-- <p class="share-quote">"Consistência supera intensidade."</p>
          <span class="share-app-url">gymtrack.vercel.app</span> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import html2canvas from 'html2canvas';

const store = useStore();
const router = useRouter();

const routines = computed(() => {
  const all = [...store.getters['workouts/allRoutines']];
  return all.sort((a, b) => {
    const daysA = a.daysOfWeek || [];
    const daysB = b.daysOfWeek || [];
    
    // Rotinas sem dias definidos vão para o final
    if (daysA.length === 0 && daysB.length === 0) {
      return a.name.localeCompare(b.name);
    }
    if (daysA.length === 0) return 1;
    if (daysB.length === 0) return -1;
    
    // Mapear dias considerando Domingo (0) como o último dia da semana de treino (valor 7)
    const mappedA = daysA.map(d => d === 0 ? 7 : d).sort((x, y) => x - y);
    const mappedB = daysB.map(d => d === 0 ? 7 : d).sort((x, y) => x - y);
    
    const minA = mappedA[0];
    const minB = mappedB[0];
    
    if (minA !== minB) {
      return minA - minB;
    }
    
    // Desempate pelos demais dias de treino da rotina
    const maxLength = Math.max(mappedA.length, mappedB.length);
    for (let i = 1; i < maxLength; i++) {
      const valA = mappedA[i] !== undefined ? mappedA[i] : -1;
      const valB = mappedB[i] !== undefined ? mappedB[i] : -1;
      if (valA !== valB) {
        return valA - valB;
      }
    }
    
    return a.name.localeCompare(b.name);
  });
});
const history = computed(() => store.getters['history/allSessions']);
const lastSession = computed(() => store.getters['history/lastSession']);

const lastSessionExerciseCount = computed(() => {
  if (!lastSession.value || !lastSession.value.exercises) return 0;
  return lastSession.value.exercises.filter(ex => !ex.isNotes).length;
});

const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

const formatSessionDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) => 
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) {
    return 'Hoje';
  } else if (isSameDay(date, yesterday)) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
};

const goToHistory = () => {
  router.push('/history');
};

// Calcula os dias da semana atual (Segunda a Domingo) e verifica se o usuário treinou neles
const weekDays = computed(() => {
  const list = [];
  const today = new Date();
  
  // Obtém a Segunda-feira da semana atual
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const dayChars = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  // Conjunto de datas treinadas no formato YYYY-MM-DD
  const trainedDates = new Set(
    history.value.map(session => {
      const d = new Date(session.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    
    const key = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
    const hasTrained = trainedDates.has(key);
    
    const isToday = 
      currentDay.getDate() === today.getDate() && 
      currentDay.getMonth() === today.getMonth() && 
      currentDay.getFullYear() === today.getFullYear();

    list.push({
      label: dayLabels[i],
      char: dayChars[i],
      hasTrained,
      isToday
    });
  }

  return list;
});



const getScheduledDaysOfWeek = computed(() => {
  const scheduled = new Set();
  routines.value.forEach(r => {
    if (r.daysOfWeek && Array.isArray(r.daysOfWeek)) {
      r.daysOfWeek.forEach(d => scheduled.add(d));
    }
  });
  return scheduled;
});

// Streak de dias seguidos treinando (respeitando dias de descanso)
const currentStreak = computed(() => {
  if (history.value.length === 0) return 0;
  
  const sessionDateSet = new Set(history.value.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }));
  
  const scheduledDays = getScheduledDaysOfWeek.value;
  const hasSchedule = scheduledDays.size > 0;
  
  let streak = 0;
  const today = new Date();
  let hasTrainedInStreak = false;
  
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// Smart logic to suggest the next workout based on daysOfWeek or history
const suggestedRoutine = computed(() => {
  if (routines.value.length === 0) return null;

  // 1. Try to find a workout scheduled for TODAY
  const today = new Date().getDay(); // 0 = Dom, 1 = Seg...
  const todayRoutines = routines.value.filter(r => r.daysOfWeek && r.daysOfWeek.includes(today));
  
  if (todayRoutines.length > 0) {
    // Ideally we would check if it was already completed today, but for now return the first one scheduled
    return todayRoutines[0];
  }

  // 2. Fallback: if no workout is scheduled for today, use the history logic
  if (!lastSession.value) return routines.value[0]; // If no history, suggest the first one

  // Find index of last routine in our current routines
  const lastIndex = routines.value.findIndex(r => r.id === lastSession.value.routineId);
  
  if (lastIndex === -1 || lastIndex === routines.value.length - 1) {
    // If not found or was the last one, loop back to the first
    return routines.value[0];
  }
  
  // Suggest the next one in the list
  return routines.value[lastIndex + 1];
});

const startWorkout = (id) => {
  router.push(`/workout/${id}`);
};

// Lógica de Compartilhamento de Treino
const shareLoading = ref(false);
const sharingSession = ref(null);
const shareCardRef = ref(null);
const showPreviewDialog = ref(false);

const templates = [
  { id: 'theme-dark-grid', name: 'Classic Dark' },
  { id: 'theme-transparent', name: 'Adesivo Transparente' },
  { id: 'theme-light-clean', name: 'Clean Light' },
  { id: 'theme-neon-power', name: 'Neon Purple' },
  { id: 'theme-minimal-metrics', name: 'Métricas Minimal' }
];
const currentTemplateIndex = ref(0);
const activeTemplate = computed(() => templates[currentTemplateIndex.value].id);
const activeTemplateName = computed(() => templates[currentTemplateIndex.value].name);

const nextTemplate = () => {
  currentTemplateIndex.value = (currentTemplateIndex.value + 1) % templates.length;
};

const prevTemplate = () => {
  currentTemplateIndex.value = (currentTemplateIndex.value - 1 + templates.length) % templates.length;
};

const getSessionExercises = (session) => {
  if (!session || !session.exercises) return [];
  return session.exercises.filter(e => !e.isNotes && !e.isCardio);
};

const formatShareDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();
};

const shareSession = (session) => {
  sharingSession.value = session;
  showPreviewDialog.value = true;
};

const executeShare = async () => {
  if (!sharingSession.value) return;

  const session = sharingSession.value;
  shareLoading.value = true;
  showPreviewDialog.value = false;

  // Aguarda o Vue processar a alteração reativa e renderizar o DOM offscreen
  await nextTick();

  // Pequeno intervalo para garantir a correta renderização de fontes e ícones do Vuetify
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!shareCardRef.value) {
    shareLoading.value = false;
    sharingSession.value = null;
    return;
  }

  try {
    const isTransparent = activeTemplate.value === 'theme-transparent' || activeTemplate.value === 'theme-minimal-metrics';
    const canvas = await html2canvas(shareCardRef.value, {
      useCORS: true,
      allowTaint: true,
      scale: 2, // Aumenta a resolução para um compartilhamento limpo
      backgroundColor: isTransparent ? null : '#0d1b22',
      logging: false
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error('Falha ao gerar o blob da imagem.');
      }
      
      const filename = `treino-${session.routineName.toLowerCase().replace(/\s+/g, '-')}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // Compartilha nativamente se houver suporte à Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Meu Treino',
            text: `Mais um treino concluído no Gym Track! 🦾 #GymTrack`
          });
        } catch (shareErr) {
          if (shareErr.name !== 'AbortError') {
            console.error('Erro ao compartilhar:', shareErr);
            triggerDownload(canvas, filename);
          }
        }
      } else {
        // Fallback: executa o download direto do card gerado
        triggerDownload(canvas, filename);
      }
      
      sharingSession.value = null;
    }, 'image/png');
  } catch (err) {
    console.error('Erro ao gerar card de compartilhamento:', err);
    sharingSession.value = null;
  } finally {
    shareLoading.value = false;
  }
};

const triggerDownload = (canvas, filename) => {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Monitora o estado de fechamento do preview para limpar a memória
watch(showPreviewDialog, (newVal) => {
  if (!newVal && !shareLoading.value) {
    sharingSession.value = null;
  }
});
</script>

<style scoped>
.hover-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
.hover-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
}
.border-dashed {
  border-style: dashed !important;
  border-width: 1px;
}
.last-session-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  cursor: pointer;
}
.last-session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 230, 118, 0.06) !important;
  border-color: rgba(0, 230, 118, 0.2) !important;
}
.card-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 230, 118, 0.03) 0%, rgba(0, 176, 255, 0.03) 100%);
  pointer-events: none;
  z-index: 0;
}
.week-day-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}
.week-day-circle.trained {
  background-color: rgba(0, 230, 118, 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-color: rgba(0, 230, 118, 0.4) !important;
  font-weight: 700;
}
.week-day-circle.today {
  border-color: rgb(var(--v-theme-secondary)) !important;
  border-width: 1.5px;
}
.week-day-circle.trained.today {
  background-color: rgba(0, 230, 118, 0.18) !important;
  border-color: rgb(var(--v-theme-secondary)) !important;
}

/* Off-screen share card styles (Instagram Stories 1080x1920 ratio) */
.share-card-container-offscreen {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 1080px;
  height: 1920px;
  z-index: -999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.share-card-inner {
  width: 1080px;
  height: 1920px;
  padding: 120px 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.share-logo-icon {
  font-size: 52px !important;
  color: #00E676 !important;
}

.share-logo-text {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #ffffff;
}

.share-card-content {
  display: flex;
  flex-direction: column;
  z-index: 2;
  margin-top: -60px;
}

.share-workout-date {
  font-size: 20px;
  font-weight: 700;
  color: #00E676;
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.share-workout-title {
  font-size: 68px;
  font-weight: 900;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 50px;
  text-transform: uppercase;
}

.share-divider {
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 230, 118, 0.4) 0%, rgba(0, 176, 255, 0) 100%);
  margin-bottom: 50px;
}

.share-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 50px;
}

.share-stat-box {
  display: flex;
  flex-direction: column;
}

.share-stat-val {
  font-size: 56px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.1;
}

.share-stat-lbl {
  font-size: 18px;
  font-weight: 700;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 8px;
}

.share-exercises-title {
  font-size: 22px;
  font-weight: 800;
  text-transform: uppercase;
  color: #8E8E93;
  letter-spacing: 1.5px;
  margin-bottom: 25px;
}

.share-exercises-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.share-exercise-item {
  display: flex;
  align-items: center;
}

.share-check-icon {
  font-size: 28px !important;
  color: #00E676 !important;
}

.share-exercise-name {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
}

.share-exercise-more {
  font-size: 22px;
  font-weight: 700;
  color: #00b0ff;
  margin-top: 15px;
  font-style: italic;
}



.share-quote {
  font-size: 24px;
  font-weight: 500;
  color: #E5E5EA;
  font-style: italic;
  margin-bottom: 15px;
}

.share-app-url {
  font-size: 16px;
  font-weight: 700;
  color: #8E8E93;
  letter-spacing: 1px;
}

/* Styles for preview dialog container and scaled card */
.preview-image-container {
  width: 240px;
  height: 426.66px;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  background-color: #0d1b22;
}

.preview-scaled {
  transform: scale(0.2222); /* 240 / 1080 = 0.2222 */
  transform-origin: top left;
  width: 1080px !important;
  height: 1920px !important;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
}

/* Template Themes */

/* CLASSIC DARK */
.theme-dark-grid {
  background: linear-gradient(135deg, #0f1c24 0%, #060c0f 100%) !important;
  color: #ffffff !important;
}
.theme-dark-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 1;
  pointer-events: none;
}

/* TRANSPARENT (STICKER) */
.theme-transparent {
  background: transparent !important;
  color: #ffffff !important;
}
.theme-transparent::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  pointer-events: none;
  z-index: 1;
}


/* CLEAN LIGHT */
.theme-light-clean {
  background: linear-gradient(135deg, #f4f6f9 0%, #ffffff 100%) !important;
  color: #1e1e1e !important;
}
.theme-light-clean::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 1;
  pointer-events: none;
}
.theme-light-clean .share-logo-text,
.theme-light-clean .share-workout-title,
.theme-light-clean .share-stat-val,
.theme-light-clean .share-exercise-name {
  color: #1e1e1e !important;
}
.theme-light-clean .share-divider {
  background: linear-gradient(90deg, rgba(0, 230, 118, 0.4) 0%, rgba(0, 0, 0, 0.05) 100%);
}

.theme-light-clean .share-quote {
  color: #555555;
}

/* NEON PURPLE */
.theme-neon-power {
  background: linear-gradient(135deg, #120e24 0%, #090615 100%) !important;
  color: #ffffff !important;
}
.theme-neon-power::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(175, 82, 222, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(175, 82, 222, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 1;
  pointer-events: none;
}
.theme-neon-power .share-logo-icon,
.theme-neon-power .share-workout-date,
.theme-neon-power .share-check-icon {
  color: #AF52DE !important;
}
.theme-neon-power .share-divider {
  background: linear-gradient(90deg, rgba(175, 82, 222, 0.4) 0%, rgba(0, 176, 255, 0) 100%);
}
.theme-neon-power .share-exercise-more {
  color: #ff2d55;
}

/* MINIMAL METRICS */
.theme-minimal-metrics {
  background: transparent !important;
  color: #ffffff !important;
}
.theme-minimal-metrics::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border-radius: 40px;
  pointer-events: none;
  z-index: 1;
}
.theme-minimal-metrics .share-stats-grid {
  grid-template-columns: 1fr;
  gap: 35px;
  margin-top: 50px;
  margin-bottom: 50px;
  width: 100%;
}
.theme-minimal-metrics .share-stat-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px 30px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.theme-minimal-metrics .share-stat-val {
  font-size: 72px;
  color: #00E676;
  font-weight: 900;
}
.theme-minimal-metrics .share-stat-lbl {
  font-size: 20px;
  margin-top: 12px;
  color: #8E8E93;
}
</style>
