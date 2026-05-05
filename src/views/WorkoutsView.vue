<template>
  <div class="workouts-view pb-16">
    <div class="d-flex align-center justify-space-between mb-6 mt-4">
      <h1 class="text-h4 font-weight-bold">Meus Treinos</h1>
      <v-btn color="primary" icon="mdi-plus" size="small" @click="createNewRoutine"></v-btn>
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
              {{ ex.name }} ({{ ex.sets }}x{{ ex.reps }})
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
        <v-icon icon="mdi-dumbbell" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h2 class="text-h6 text-medium-emphasis">Você ainda não tem treinos cadastrados.</h2>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

const createNewRoutine = () => {
  router.push('/workout/create');
};

const editRoutine = (routine) => {
  router.push(`/workout/edit/${routine.id}`);
};

const deleteRoutine = (id) => {
  if (confirm('Tem certeza que deseja excluir este treino?')) {
    store.dispatch('workouts/deleteRoutine', id);
  }
};
</script>
