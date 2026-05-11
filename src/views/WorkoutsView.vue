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
                  <v-list-item @click="deleteRoutine(routine.id)">
                    <v-list-item-title class="text-error">Excluir</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-card-item>
          
          <v-card-text>
            <v-chip size="small" class="mr-2 mb-2 bg-background" v-for="ex in routine.exercises" :key="ex.id">
              {{ ex.name }} ({{ ex.setsMax }}x{{ ex.repsMax }})
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

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
