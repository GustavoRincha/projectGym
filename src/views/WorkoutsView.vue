<template>
  <div class="workouts-view pb-16">
    <div class="d-flex align-center justify-space-between mb-6 mt-4">
      <h1 class="text-h4 font-weight-bold">Meus Treinos</h1>
      
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn color="primary" icon="mdi-plus" size="small" v-bind="props" elevation="2"></v-btn>
        </template>
        <v-list bg-color="surface">
          <v-list-item @click="createNewRoutine">
            <template v-slot:prepend><v-icon>mdi-pencil-plus</v-icon></template>
            <v-list-item-title>Criar do Zero</v-list-item-title>
          </v-list-item>
          <v-list-item @click="suggestRoutine">
            <template v-slot:prepend><v-icon color="secondary">mdi-magic-staff</v-icon></template>
            <v-list-item-title>Assistente / Catálogo</v-list-item-title>
          </v-list-item>
          <v-list-item @click="openImportDialog">
            <template v-slot:prepend><v-icon color="primary">mdi-download</v-icon></template>
            <v-list-item-title>Importar por Código</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-row v-if="routines.length > 0">
      <v-col cols="12" v-for="routine in routines" :key="routine.id">
        <v-card color="surface" elevation="2" rounded="lg" class="mb-2">
          <v-card-item>
            <template v-slot:title>
              <span class="text-h6 font-weight-bold">{{ routine.name }}</span>
            </template>
            <template v-slot:subtitle>
              <div class="mt-1">
                <v-chip size="x-small" color="secondary" class="mr-1 mb-1" v-if="routine.objective">{{ routine.objective }}</v-chip>
                <v-chip size="x-small" color="info" class="mr-1 mb-1" v-if="routine.split">Divisão: {{ routine.split }}</v-chip>
                <v-chip size="x-small" color="primary" variant="outlined" class="mb-1" v-if="routine.daysOfWeek && routine.daysOfWeek.length">
                  {{ formatDays(routine.daysOfWeek) }}
                </v-chip>
              </div>
            </template>
            <template v-slot:append>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                </template>
                <v-list bg-color="surface">
                  <v-list-item @click="editRoutine(routine)">
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openShareDialog(routine)">
                    <v-list-item-title class="text-success">Compartilhar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteRoutine(routine.id)">
                    <v-list-item-title class="text-error">Excluir</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-card-item>
          
          <v-card-text>
            <v-chip size="small" class="mr-2 mb-2 bg-background" v-for="ex in routine.exercises" :key="ex.id">
              <span v-if="ex.machine === 'Cardio'">
                <v-icon icon="mdi-heart-pulse" size="x-small" class="mr-1 text-secondary"></v-icon>
                {{ ex.name }} ({{ ex.setsMax }} min)
              </span>
              <span v-else>
                {{ ex.name }} ({{ ex.setsMax }}x{{ ex.repsMax }})
              </span>
            </v-chip>
          </v-card-text>

          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="primary" variant="text" block @click="startWorkout(routine.id)">
              Iniciar Este Treino
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row v-else class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-flask-empty-outline" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h2 class="text-h6 text-medium-emphasis mb-6">Você ainda não tem treinos cadastrados.</h2>
        
        <v-btn color="primary" block size="large" rounded="pill" class="mb-4" @click="suggestRoutine" prepend-icon="mdi-magic-staff">
          Encontrar Treino Ideal (Assistente)
        </v-btn>
        <v-btn color="surface" variant="flat" block size="large" rounded="pill" @click="createNewRoutine" prepend-icon="mdi-pencil-plus">
          Criar Treino do Zero
        </v-btn>
      </v-col>
    </v-row>

    <!-- Dialog de Confirmação de Exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4 text-error">
          <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>Excluir Treino
        </v-card-title>
        <v-card-text class="px-4 py-2 text-medium-emphasis">
          Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">Sim, Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para Importar Treino -->
    <v-dialog v-model="importDialog" max-width="450">
      <v-card color="surface" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4">
          <v-icon icon="mdi-download" class="mr-2 text-primary"></v-icon>Importar Treino
        </v-card-title>
        
        <!-- Passo 1: Inserir Código -->
        <template v-if="importStep === 'input'">
          <v-card-text class="px-4 py-2">
            <p class="text-caption text-medium-emphasis mb-4">
              Insira o código de compartilhamento do treino para buscá-lo no sistema.
            </p>
            <v-text-field
              v-model="shareCodeInput"
              label="Código do Treino (UUID)"
              placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="importLoading"
              class="mb-2"
            ></v-text-field>
            <div v-if="importError" class="text-caption text-error mt-2">
              <v-icon icon="mdi-alert-circle" size="x-small" class="mr-1"></v-icon>
              {{ importError }}
            </div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4 pt-2">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="importDialog = false" :disabled="importLoading">Cancelar</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="fetchSharedRoutine"
              :loading="importLoading"
              :disabled="!shareCodeInput.trim()"
            >
              Buscar Treino
            </v-btn>
          </v-card-actions>
        </template>

        <!-- Passo 2: Pré-visualização do Treino Encontrado -->
        <template v-else-if="importStep === 'preview'">
          <v-card-text class="px-4 py-2">
            <div class="mb-3">
              <span class="text-caption text-primary font-weight-bold uppercase" style="letter-spacing: 1px;">Treino Encontrado!</span>
              <h3 class="text-h6 font-weight-bold mt-1">{{ previewRoutine?.name }}</h3>
              <p class="text-caption text-medium-emphasis mt-1">
                Compartilhado por: <strong class="text-high-emphasis">{{ previewRoutine?.created_by_name || 'Usuário do Gym Track' }}</strong>
              </p>
            </div>

            <v-divider class="mb-3"></v-divider>

            <div class="mb-1 text-subtitle-2 font-weight-bold text-medium-emphasis">
              Detalhes do Treino:
            </div>
            <div class="d-flex flex-wrap gap-2 mb-3" style="gap: 8px;">
              <v-chip size="small" variant="flat" color="surface-variant" v-if="previewRoutine?.objective">
                Foco: {{ previewRoutine.objective }}
              </v-chip>
              <v-chip size="small" variant="flat" color="surface-variant" v-if="previewRoutine?.split">
                Divisão: {{ previewRoutine.split }}
              </v-chip>
              <v-chip size="small" variant="flat" color="primary">
                {{ previewRoutine?.exercises?.length || 0 }} exercícios
              </v-chip>
            </div>

            <div class="mb-1 text-subtitle-2 font-weight-bold text-medium-emphasis">
              Exercícios incluídos:
            </div>
            <v-list density="compact" class="bg-background rounded-lg pa-2 border" style="max-height: 180px; overflow-y: auto;">
              <v-list-item v-for="ex in previewRoutine?.exercises" :key="ex.id" class="px-2">
                <template v-slot:prepend>
                  <v-icon :icon="ex.machine === 'Cardio' ? 'mdi-heart-pulse' : 'mdi-dumbbell'" size="small" class="mr-2" color="secondary"></v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">{{ ex.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption text-medium-emphasis">
                  {{ ex.machine === 'Cardio' ? `${ex.sets_max} min` : `${ex.sets_min} a ${ex.sets_max} séries` }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            
            <div v-if="importError" class="text-caption text-error mt-2">
              <v-icon icon="mdi-alert-circle" size="x-small" class="mr-1"></v-icon>
              {{ importError }}
            </div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4 pt-2">
            <v-btn variant="text" @click="importStep = 'input'" :disabled="importLoading">Voltar</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              variant="flat"
              @click="confirmImport"
              :loading="importLoading"
            >
              Confirmar Importação
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-dialog>

    <!-- Dialog para Compartilhar Treino -->
    <v-dialog v-model="shareDialog" max-width="450">
      <v-card color="surface" rounded="lg" v-if="selectedRoutineToShare">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4 text-success">
          <v-icon icon="mdi-share-variant" class="mr-2"></v-icon>Compartilhar Treino
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <p class="text-caption text-medium-emphasis mb-3">
            Envie este código para seus amigos. Eles poderão importar este treino completo na conta deles!
          </p>
          <div class="pa-3 bg-background border border-dashed d-flex align-center justify-space-between rounded-lg mb-2">
            <code class="text-body-2 font-weight-bold select-all" style="font-family: monospace; word-break: break-all; user-select: all;">
              {{ selectedRoutineToShare.id }}
            </code>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="small"
              color="primary"
              @click="copyShareCode"
              class="ml-2"
            ></v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="shareDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para feedbacks -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { supabase } from '@/plugins/supabase';

const store = useStore();
const router = useRouter();

// Dialogs and states for sharing/importing
const importDialog = ref(false);
const shareCodeInput = ref('');
const importLoading = ref(false);
const importError = ref('');
const importStep = ref('input'); // 'input' | 'preview'
const previewRoutine = ref(null);

const shareDialog = ref(false);
const selectedRoutineToShare = ref(null);

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showMessage = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const openImportDialog = () => {
  shareCodeInput.value = '';
  importError.value = '';
  importStep.value = 'input';
  previewRoutine.value = null;
  importDialog.value = true;
};

const fetchSharedRoutine = async () => {
  const code = shareCodeInput.value.trim();
  if (!code) return;

  importLoading.value = true;
  importError.value = '';

  try {
    // 1. Fetch routine from Supabase
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', code)
      .single();

    if (routineError || !routineData) {
      throw new Error('Não foi possível encontrar o treino correspondente a este código. Verifique se o código está correto ou se o treino existe.');
    }

    // 2. Fetch exercises of this routine
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('routine_id', code);

    if (exercisesError) {
      throw new Error('Erro ao carregar os exercícios do treino compartilhado.');
    }

    // 3. Save to preview routine
    previewRoutine.value = {
      ...routineData,
      exercises: exercisesData || []
    };
    importStep.value = 'preview';
  } catch (err) {
    console.error('Error fetching shared routine:', err);
    importError.value = err.message || 'Erro inesperado ao buscar o treino.';
  } finally {
    importLoading.value = false;
  }
};

const confirmImport = async () => {
  if (!previewRoutine.value) return;

  importLoading.value = true;
  importError.value = '';

  try {
    const routineData = previewRoutine.value;
    // Create a clone structure
    const newRoutine = {
      name: `${routineData.name} (Importado)`,
      objective: routineData.objective || '',
      split: routineData.split || '',
      daysOfWeek: routineData.days_of_week || [],
      exercises: routineData.exercises.map(ex => ({
        name: ex.name,
        machine: ex.machine,
        setsMin: ex.sets_min,
        setsMax: ex.sets_max,
        repsMin: ex.reps_min,
        repsMax: ex.reps_max,
        failureSets: ex.failure_sets,
        weight: ex.weight,
        progressionType: ex.progression_type,
        progressionValue: ex.progression_value,
        progressionFrequency: ex.progression_frequency,
        progressionPerSet: ex.progression_per_set
      }))
    };

    // Dispatch to store to save and sync automatically
    await store.dispatch('workouts/addRoutine', newRoutine);

    // Success feedback
    importDialog.value = false;
    showMessage('Treino importado com sucesso!', 'success');
  } catch (err) {
    console.error('Error importing routine:', err);
    importError.value = err.message || 'Erro inesperado ao importar o treino.';
  } finally {
    importLoading.value = false;
  }
};

const openShareDialog = async (routine) => {
  const currentName = store.state.auth?.user?.user_metadata?.name || 
                      store.state.auth?.user?.user_metadata?.username || 
                      (store.state.auth?.user?.email ? store.state.auth.user.email.split('@')[0] : '') || 
                      'Desconhecido';

  if (!routine.created_by_name || routine.created_by_name === 'Desconhecido') {
    if (currentName !== 'Desconhecido') {
      const updatedRoutine = {
        ...routine,
        created_by_name: currentName
      };
      try {
        await store.dispatch('workouts/updateRoutine', updatedRoutine);
        routine.created_by_name = currentName;
      } catch (err) {
        console.error('Error auto-updating creator name on share:', err);
      }
    }
  }
  selectedRoutineToShare.value = routine;
  shareDialog.value = true;
};

const copyShareCode = () => {
  if (selectedRoutineToShare.value) {
    navigator.clipboard.writeText(selectedRoutineToShare.value.id);
    showMessage('Código copiado para a área de transferência!', 'success');
  }
};

const routines = computed(() => store.getters['workouts/allRoutines']);

const weekDaysMap = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb'
};

const formatDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return '';
  // Sort numeric values just in case
  const sorted = [...daysArray].sort((a, b) => a - b);
  return sorted.map(d => weekDaysMap[d]).join(', ');
};

const startWorkout = (id) => {
  router.push(`/workout/${id}`);
};

const suggestRoutine = () => {
  router.push('/workout/suggest');
};

const createNewRoutine = () => {
  router.push('/workout/create');
};

const editRoutine = (routine) => {
  router.push(`/workout/edit/${routine.id}`);
};

const deleteDialog = ref(false);
const routineToDelete = ref(null);

const deleteRoutine = (id) => {
  routineToDelete.value = id;
  deleteDialog.value = true;
};

const confirmDelete = () => {
  if (routineToDelete.value) {
    store.dispatch('workouts/deleteRoutine', routineToDelete.value);
  }
  deleteDialog.value = false;
  routineToDelete.value = null;
};
</script>
