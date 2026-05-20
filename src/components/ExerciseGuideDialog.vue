<template>
  <v-dialog v-model="internalModel" max-width="500" class="exercise-guide-dialog">
    <v-card color="surface" class="dialog-card border-glow" rounded="xl">
      <!-- Cabeçalho com Botão de Fechar -->
      <v-card-title class="d-flex align-center justify-space-between pt-4 px-4 pb-2">
        <div class="d-flex align-center">
          <v-icon icon="mdi-heart-pulse" color="primary" class="mr-2"></v-icon>
          <span class="text-h6 font-weight-bold text-white">Guia de Execução</span>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="internalModel = false"></v-btn>
      </v-card-title>

      <!-- Corpo Principal -->
      <v-card-text class="px-4 py-2 text-content">
        <!-- Estado de Carregamento -->
        <div v-if="loading" class="d-flex flex-column align-center justify-center py-12">
          <v-progress-circular indeterminate color="primary" size="50" width="4" class="mb-4"></v-progress-circular>
          <p class="text-caption text-medium-emphasis">Buscando detalhes do exercício...</p>
        </div>

        <!-- Estado de Sucesso (Exercício Encontrado) -->
        <div v-else-if="exerciseData" class="exercise-details">
          <!-- GIF Animado -->
          <div class="gif-container mb-4 bg-background rounded-lg border overflow-hidden d-flex align-center justify-center">
            <v-img
              v-if="exerciseData.gifUrl"
              :src="exerciseData.gifUrl"
              max-height="250"
              cover
              alt="Execução do Exercício"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height bg-grey-darken-4">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
              </template>
            </v-img>
            <div v-else class="no-gif py-12 text-center w-full">
              <v-icon icon="mdi-image-off-outline" size="48" class="text-medium-emphasis mb-2"></v-icon>
              <p class="text-caption text-medium-emphasis">Nenhum GIF disponível para este exercício</p>
            </div>
          </div>

          <!-- Título e Subtítulo -->
          <h3 class="text-h6 font-weight-bold text-white mb-1 leading-tight text-capitalize">{{ exerciseData.name }}</h3>
          <p class="text-caption text-medium-emphasis mb-3 text-italic" v-if="exerciseData.originalName && exerciseData.originalName.toLowerCase() !== exerciseData.name.toLowerCase()">
            Inglês: {{ exerciseData.originalName }}
          </p>

          <!-- Chips de Músculo e Equipamento -->
          <div class="d-flex flex-wrap gap-2 mb-4" style="gap: 8px;">
            <v-chip size="small" variant="flat" color="primary" class="font-weight-medium">
              <v-icon icon="mdi-arm-flex" start size="x-small"></v-icon>
              Foco: {{ exerciseData.targetMuscle }}
            </v-chip>
            <v-chip size="small" variant="flat" color="secondary" class="font-weight-medium">
              <v-icon icon="mdi-dumbbell" start size="x-small"></v-icon>
              Equipamento: {{ exerciseData.equipment }}
            </v-chip>
          </div>

          <v-divider class="mb-4"></v-divider>

          <!-- Instruções Passo a Passo -->
          <div v-if="exerciseData.instructions && exerciseData.instructions.length > 0">
            <h4 class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-2">Instruções de Execução:</h4>
            <v-list density="compact" class="bg-transparent pa-0 instructions-list scrollbar-custom" style="max-height: 200px; overflow-y: auto;">
              <v-list-item
                v-for="(inst, i) in exerciseData.instructions"
                :key="i"
                class="px-0 py-1 align-start"
              >
                <template v-slot:prepend>
                  <div class="step-number d-flex align-center justify-center mr-3 mt-1">
                    {{ i + 1 }}
                  </div>
                </template>
                <v-list-item-title class="text-body-2 text-wrap text-medium-emphasis text-high-emphasis leading-normal">
                  {{ inst }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </div>

        <!-- Estado de Fallback (Exercício Não Encontrado) -->
        <div v-else class="d-flex flex-column align-center text-center py-6">
          <v-avatar color="surface-variant" size="70" class="mb-4">
            <v-icon icon="mdi-dumbbell" size="36" color="secondary"></v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-bold text-white mb-2">{{ exerciseName }}</h3>
          <p class="text-body-2 text-medium-emphasis px-4 mb-6">
            Não encontramos a execução exata deste exercício em nosso catálogo estático. Gostaria de buscar tutoriais de execução no YouTube?
          </p>
          <v-btn
            color="red-darken-2"
            variant="flat"
            prepend-icon="mdi-youtube"
            class="text-none font-weight-bold px-6 rounded-lg"
            :href="`https://www.youtube.com/results?search_query=como+fazer+${encodeURIComponent(exerciseName)}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buscar no YouTube
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4 pt-2">
        <v-spacer></v-spacer>
        <v-btn variant="text" color="primary" class="font-weight-bold" @click="internalModel = false">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { getExerciseDetails } from '@/services/exerciseDatabaseService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  exerciseName: {
    type: String,
    required: true,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// Bind do dialog
const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const exerciseData = ref(null);

const fetchDetails = async () => {
  if (!props.exerciseName) {
    exerciseData.value = null;
    return;
  }

  loading.value = true;
  try {
    const data = await getExerciseDetails(props.exerciseName);
    exerciseData.value = data;
  } catch (err) {
    console.error('Erro ao buscar detalhes no dialog:', err);
    exerciseData.value = null;
  } finally {
    loading.value = false;
  }
};

// Observa abertura do diálogo ou mudança de exercício para recarregar
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchDetails();
  }
});

watch(() => props.exerciseName, () => {
  if (props.modelValue) {
    fetchDetails();
  }
});
</script>

<style scoped>
.border-glow {
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.gif-container {
  height: 250px;
  background-color: #121212 !important;
}

.step-number {
  width: 20px;
  height: 20px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Customização de Scrollbar para ficar sutil e premium */
.scrollbar-custom::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

.leading-normal {
  line-height: 1.4 !important;
}
</style>
