<template>
  <div class="notes-panel pb-16">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">Notas e Objetivos</h3>
      <v-btn color="primary" icon="mdi-plus" size="small" @click="showAddGoal = true"></v-btn>
    </div>

    <v-row v-if="goals.length > 0">
      <v-col cols="12" v-for="goal in goals" :key="goal.id">
        <v-card color="surface" elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold text-wrap">{{ goal.title }}</span>
            <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteGoal(goal.id)"></v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="goal.comments && goal.comments.length > 0" class="mb-4">
              <h4 class="text-subtitle-2 text-medium-emphasis mb-2">Evolução:</h4>
              <div v-for="(comment, index) in goal.comments" :key="index" class="mb-2 pl-3 border-s-2 border-primary">
                <div class="text-caption text-medium-emphasis">{{ formatDate(comment.date) }}</div>
                <div class="text-body-2">{{ comment.text }}</div>
              </div>
            </div>
            <div v-else>
              <p class="text-body-2 text-medium-emphasis">Nenhuma anotação de evolução ainda.</p>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-text-field
              v-model="newComments[goal.id]"
              placeholder="Adicionar anotação sobre a evolução..."
              variant="outlined"
              density="compact"
              hide-details
              bg-color="background"
              class="mr-2"
              @keyup.enter="addComment(goal.id)"
            ></v-text-field>
            <v-btn color="primary" icon="mdi-send" variant="tonal" size="small" @click="addComment(goal.id)"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-note-text-outline" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h2 class="text-h6 text-medium-emphasis">Nenhuma nota cadastrada ainda.</h2>
      </v-col>
    </v-row>

    <v-dialog v-model="showAddGoal" max-width="500">
      <v-card color="surface">
        <v-card-title>Nova Nota / Objetivo</v-card-title>
        <v-card-text>
          <v-text-field v-model="newGoalTitle" label="Onde você quer chegar?" placeholder="Ex: Chegar a 80kg de peso corporal" variant="outlined" autofocus @keyup.enter="saveNewGoal"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showAddGoal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveNewGoal">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const goals = computed(() => store.getters['goals/allGoals']);

const showAddGoal = ref(false);
const newGoalTitle = ref('');
const newComments  = ref({});

const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR');

const saveNewGoal = () => {
  if (newGoalTitle.value.trim()) {
    store.dispatch('goals/addGoal', newGoalTitle.value.trim());
    newGoalTitle.value = '';
    showAddGoal.value = false;
  }
};

const deleteGoal = (id) => {
  if (confirm('Tem certeza que deseja excluir esta nota?')) store.dispatch('goals/deleteGoal', id);
};

const addComment = (goalId) => {
  const text = newComments.value[goalId];
  if (text?.trim()) {
    store.dispatch('goals/addComment', { goalId, text: text.trim() });
    newComments.value[goalId] = '';
  }
};
</script>
