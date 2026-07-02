<template>
  <div class="history-view pb-16">
    <h1 class="text-h4 font-weight-bold mb-6 mt-4">Histórico</h1>

    <div v-if="sessions.length > 0">
      <!-- Filtros de Período -->
      <div class="d-flex justify-center mb-6">
        <v-btn-toggle
          v-model="selectedPeriod"
          mandatory
          color="primary"
          variant="tonal"
          rounded="pill"
          density="compact"
        >
          <v-btn value="week" class="text-caption font-weight-bold">Esta Semana</v-btn>
          <v-btn value="month" class="text-caption font-weight-bold">Este Mês</v-btn>
          <!-- <v-btn value="30days" class="text-caption font-weight-bold">Últimos 30d</v-btn> -->
          <v-btn value="all" class="text-caption font-weight-bold">Todos</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Exibição dos Treinos Filtrados -->
      <div v-if="filteredSessions.length > 0">
        <v-timeline :density="$vuetify.display.xs ? 'compact' : 'default'" side="end" align="start" truncate-line="both">
          <v-timeline-item
            v-for="session in filteredSessions"
            :key="session.id"
            dot-color="primary"
            size="small"
            icon="mdi-dumbbell"
          >
            <v-card color="surface" elevation="2" rounded="xl" class="mb-4 overflow-hidden border border-light-trans">
              <!-- Cabeçalho do Card (Sempre visível, clicável para expandir) -->
              <div @click="toggleSession(session.id)" class="session-header pa-3 pa-sm-4">
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <span class="text-caption text-medium-emphasis font-weight-bold d-block mb-1">
                      <v-icon icon="mdi-calendar-outline" size="x-small" class="mr-1"></v-icon>
                      {{ formatDate(session.date) }}
                    </span>
                    <h3 class="text-subtitle-1 font-weight-black text-high-emphasis leading-tight mb-2">
                      {{ session.routineName }}
                    </h3>
                  </div>
                  <div class="d-flex align-center">
                    <v-btn
                      icon="mdi-share-variant-outline"
                      variant="text"
                      size="small"
                      color="primary"
                      class="mr-1 share-button-action"
                      @click.stop="shareSession(session)"
                      title="Compartilhar Treino"
                    ></v-btn>
                    <v-btn
                      icon="mdi-chevron-down"
                      variant="text"
                      size="small"
                      color="medium-emphasis"
                      :class="['chevron-icon', { 'expanded': expanded[session.id] }]"
                      @click.stop="toggleSession(session.id)"
                    ></v-btn>
                  </div>
                </div>

                <!-- Quick stats chips -->
                <div class="d-flex flex-wrap gap-2 mt-1" style="gap: 8px;">
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                    <v-icon icon="mdi-clock-outline" size="x-small" class="mr-1"></v-icon>
                    {{ formatDuration(session.duration) }}
                  </v-chip>
                  
                  <v-chip size="x-small" color="secondary" variant="tonal" class="font-weight-bold">
                    <v-icon icon="mdi-dumbbell" size="x-small" class="mr-1"></v-icon>
                    {{ getSessionExercises(session).length }} Exs
                  </v-chip>

                  <v-chip 
                    v-if="getSessionCardios(session).length > 0" 
                    size="x-small" 
                    color="success" 
                    variant="tonal" 
                    class="font-weight-bold"
                  >
                    <v-icon icon="mdi-heart-pulse" size="x-small" class="mr-1"></v-icon>
                    Cardio
                  </v-chip>

                  <v-chip 
                    v-if="getSessionNotes(session)" 
                    size="x-small" 
                    color="info" 
                    variant="tonal" 
                    class="font-weight-bold"
                  >
                    <v-icon icon="mdi-note-text-outline" size="x-small" class="mr-1"></v-icon>
                    Obs
                  </v-chip>
                </div>
              </div>

              <!-- Detalhes do Treino (Expandido) -->
              <v-expand-transition>
                <div v-show="expanded[session.id] || false">
                  <v-divider></v-divider>
                  <div class="pa-3 pa-sm-4 pt-3">
                    <!-- Título da seção -->
                    <h4 class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis mb-3">
                      Exercícios e Séries
                    </h4>

                    <!-- Lista de Exercícios -->
                    <div class="d-flex flex-column" style="gap: 12px;">
                      <div 
                        v-for="ex in getSessionExercises(session)" 
                        :key="ex.id" 
                        class="exercise-row"
                      >
                        <div class="d-flex justify-space-between align-start">
                          <div style="flex: 1; min-width: 0;" class="mr-2">
                            <span class="text-body-2 font-weight-bold text-high-emphasis d-block" style="word-break: break-word;">{{ ex.name }}</span>
                            <span class="text-caption text-medium-emphasis d-block" style="word-break: break-word;" v-if="ex.machine">
                              Equipamento: {{ ex.machine }}
                            </span>
                          </div>
                          <v-chip size="x-small" color="primary" variant="outlined" class="font-weight-black" style="flex-shrink: 0;">
                            {{ getCompletedSetsCount(ex) }}/{{ ex.setsMax || ex.sets || (ex.performed ? ex.performed.length : 0) }} séries
                          </v-chip>
                        </div>
                        
                        <!-- Detalhes de carga e repetições das séries -->
                        <div class="d-flex flex-wrap mt-1.5 pl-1" style="gap: 6px;" v-if="ex.performed && ex.performed.length">
                          <v-chip 
                            v-for="(set, sIdx) in ex.performed" 
                            :key="sIdx" 
                            size="x-small" 
                            :color="set.completed ? 'success' : 'surface-variant'" 
                            variant="tonal"
                            class="font-weight-medium"
                          >
                            S{{ sIdx + 1 }}: {{ set.weight || 0 }}kg x {{ set.reps || 0 }}
                          </v-chip>
                        </div>

                        <!-- Notas do Exercício -->
                        <div v-if="ex.notes" class="exercise-note mt-2 text-caption text-medium-emphasis pl-3">
                          <v-icon icon="mdi-note-text-outline" size="x-small" class="mr-1"></v-icon>
                          {{ ex.notes }}
                        </div>
                      </div>
                    </div>

                    <!-- Seção de Cardio -->
                    <div v-if="getSessionCardios(session).length > 0" class="mt-4 pt-3 border-t">
                      <h4 class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis mb-3">
                        Cardio Realizado
                      </h4>
                      <div class="d-flex flex-wrap gap-2" style="gap: 8px;">
                        <v-chip
                          v-for="cardio in getSessionCardios(session)"
                          :key="cardio.id"
                          size="small"
                          variant="outlined"
                          color="secondary"
                          class="font-weight-bold"
                        >
                          <v-icon :icon="getCardioIcon(cardio.name)" size="x-small" class="mr-2 text-secondary"></v-icon>
                          {{ cardio.name }}: {{ cardio.duration }} min
                          <span v-if="cardio.distance" class="ml-1">• {{ cardio.distance }} km</span>
                        </v-chip>
                      </div>
                    </div>

                    <!-- Observações Gerais do Treino -->
                    <div v-if="getSessionNotes(session)" class="mt-4 pt-3 border-t">
                      <h4 class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis mb-2">
                        Observações do Treino
                      </h4>
                      <div class="notes-box pa-3 rounded-lg text-body-2 text-medium-emphasis">
                        {{ getSessionNotes(session) }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </div>

      <!-- Estado Vazio quando Filtrado -->
      <div v-else class="text-center py-12">
        <v-icon icon="mdi-calendar-remove" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h3 class="text-h6 text-medium-emphasis font-weight-medium">Nenhum treino concluído no período selecionado.</h3>
      </div>
    </div>

    <!-- Estado Vazio Geral -->
    <v-row v-else class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-history" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h2 class="text-h6 text-medium-emphasis">Você ainda não finalizou nenhum treino.</h2>
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
            Compartilhar no Story
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
        
        <!-- Motivational Footer -->
        <div class="share-card-footer">
          <p class="share-quote">"Consistência supera intensidade."</p>
          <span class="share-app-url">gymtrack.vercel.app</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import html2canvas from 'html2canvas';

const store = useStore();
const sessions = computed(() => store.getters['history/allSessions']);

// Lógica de Compartilhamento de Treino
const shareLoading = ref(false);
const sharingSession = ref(null);
const shareCardRef = ref(null);
const showPreviewDialog = ref(false);

const templates = [
  { id: 'theme-dark-grid', name: 'Classic Dark' },
  { id: 'theme-transparent', name: 'Adesivo Transparente' },
  { id: 'theme-light-clean', name: 'Clean Light' },
  { id: 'theme-neon-power', name: 'Neon Purple' }
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
    const isTransparent = activeTemplate.value === 'theme-transparent';
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

// Controle de Expansão dos Cards
const expanded = ref({});
const selectedPeriod = ref('week');

const toggleSession = (id) => {
  expanded.value[id] = !expanded.value[id];
};

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const filteredSessions = computed(() => {
  const allSessions = sortedSessions.value;
  if (selectedPeriod.value === 'all') {
    return allSessions;
  }

  const now = new Date();
  
  if (selectedPeriod.value === 'week') {
    // Segunda-feira da semana atual
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    
    return allSessions.filter(s => new Date(s.date) >= monday);
  }

  if (selectedPeriod.value === 'month') {
    // Primeiro dia do mês atual
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    return allSessions.filter(s => new Date(s.date) >= firstDayOfMonth);
  }

  if (selectedPeriod.value === '30days') {
    // Últimos 30 dias
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    return allSessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
  }

  return allSessions;
});

const formatDate = (isoString) => {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
  const formatted = new Date(isoString).toLocaleDateString('pt-BR', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

const getSessionExercises = (session) => {
  return (session.exercises || []).filter(e => !e.isNotes && !e.isCardio);
};

const getCompletedSetsCount = (ex) => {
  return (ex.performed || []).filter(s => s.completed).length;
};

const getSessionNotes = (session) => {
  const notesObj = (session.exercises || []).find(e => e.isNotes);
  return notesObj ? notesObj.notes : '';
};

const getSessionCardios = (session) => {
  return (session.exercises || []).filter(e => e.isCardio);
};

const getCardioIcon = (name) => {
  if (!name || typeof name !== 'string') return 'mdi-heart-pulse';
  const n = name.toLowerCase();
  if (n.includes('esteira') || n.includes('corrida') || n.includes('caminhada')) return 'mdi-run';
  if (n.includes('bicicleta') || n.includes('bike')) return 'mdi-bike';
  if (n.includes('elíptico')) return 'mdi-walk';
  if (n.includes('escada')) return 'mdi-stairs';
  if (n.includes('corda')) return 'mdi-jump-rope';
  return 'mdi-heart-pulse';
};
</script>

<style scoped>
.session-header {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.session-header:hover {
  background-color: rgba(255, 255, 255, 0.02);
}
.border-light-trans {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.chevron-icon {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.chevron-icon.expanded {
  transform: rotate(180deg);
}
.border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.notes-box {
  background-color: rgba(255, 255, 255, 0.02);
  border-left: 3px solid rgb(var(--v-theme-primary));
  font-style: italic;
}
.exercise-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 10px;
}
.exercise-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.exercise-note {
  border-left: 2px solid rgba(var(--v-theme-primary), 0.3);
  font-style: italic;
}
.v-btn-toggle .v-btn {
  padding: 0 10px !important;
  min-width: unset !important;
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

.share-card-header {
  display: flex;
  align-items: center;
  z-index: 2;
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

.share-card-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 40px;
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
  border: 2px dashed rgba(255, 255, 255, 0.25);
  border-radius: 40px;
  pointer-events: none;
  z-index: 1;
}
.theme-transparent .share-card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
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
.theme-light-clean .share-card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
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
</style>
