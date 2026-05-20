<template>
  <div class="suggest-workout pb-16">
    <div class="d-flex align-center mb-6 mt-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-2"></v-btn>
      <h1 class="text-h4 font-weight-bold">Gerador de Treinos</h1>
    </div>

    <v-tabs v-model="tab" color="primary" grow class="mb-6">
      <v-tab value="wizard">Assistente</v-tab>
      <v-tab value="catalog">Catálogo</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="bg-transparent">
      <!-- Aba: Assistente Inteligente -->
      <v-window-item value="wizard">
        <v-card color="surface" elevation="2" rounded="lg" class="pa-4" v-if="!suggestedTemplate">
          <v-card-title class="text-h5 font-weight-bold px-0 mb-4">
            Responda e deixe a IA ajudar
          </v-card-title>
          <v-card-text class="px-0">
            <p class="mb-4 text-medium-emphasis">Descobriremos o melhor programa de treino para você em 3 perguntas.</p>
            
            <v-select
              v-model="wizard.level"
              :items="['Iniciante', 'Intermediário', 'Avançado']"
              label="Qual seu nível de experiência?"
              variant="outlined"
              color="primary"
              class="mb-2"
            ></v-select>

            <v-select
              v-model="wizard.objective"
              :items="['Hipertrofia', 'Força', 'Resistência', 'Emagrecimento']"
              label="Qual o seu foco principal?"
              variant="outlined"
              color="primary"
              class="mb-2"
            ></v-select>

            <v-select
              v-model="wizard.days"
              :items="[3, 4, 5, 6]"
              label="Quantos dias por semana você vai treinar?"
              variant="outlined"
              color="primary"
              class="mb-2"
            ></v-select>
          </v-card-text>
          
          <v-card-actions class="px-0">
            <v-btn color="primary" block variant="flat" size="large" @click="generateSuggestion">
              Gerar Sugestão de Treino
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Resultado do Assistente -->
        <div v-else>
          <v-btn variant="text" prepend-icon="mdi-refresh" @click="suggestedTemplate = null" class="mb-4">
            Refazer Questionário
          </v-btn>
          <h2 class="text-h5 font-weight-bold mb-4">Programa Ideal para Você:</h2>
          
          <v-card color="surface" elevation="2" rounded="lg">
            <v-card-title class="text-h6 font-weight-bold text-wrap pt-4">{{ suggestedTemplate.name }}</v-card-title>
            <v-card-subtitle class="mt-1">
              <v-chip size="x-small" color="primary" class="mr-1 mb-1">{{ suggestedTemplate.level }}</v-chip>
              <v-chip size="x-small" color="secondary" class="mr-1 mb-1">{{ suggestedTemplate.objective }}</v-chip>
              <v-chip size="x-small" color="info" variant="outlined" class="mb-1">{{ suggestedTemplate.days }}x na semana</v-chip>
            </v-card-subtitle>
            
            <v-card-text class="mt-2">
              <p class="text-body-2 text-medium-emphasis mb-4">{{ suggestedTemplate.description }}</p>
              
              <div class="font-weight-bold mb-2">Treinos Incluídos neste Programa ({{ suggestedTemplate.routines.length }}):</div>
              <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel v-for="(rt, i) in suggestedTemplate.routines" :key="i" class="bg-background">
                  <v-expansion-panel-title class="font-weight-bold">{{ rt.name }}</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-chip
                      size="small"
                      class="mr-2 mb-2"
                      color="primary"
                      variant="tonal"
                      v-for="ex in rt.exercises"
                      :key="ex.id"
                      append-icon="mdi-information-outline"
                      @click="openGuide(ex.name)"
                      style="cursor: pointer;"
                    >
                      {{ ex.name }} ({{ ex.setsMax }}x{{ ex.repsMax }})
                    </v-chip>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
            
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn color="primary" variant="text" block @click="useTemplate(suggestedTemplate)">
                Adicionar todos aos meus treinos
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-window-item>

      <!-- Aba: Catálogo -->
      <v-window-item value="catalog">
        <p class="text-medium-emphasis mb-4">Explore nossos programas completos baseados nos métodos mais populares.</p>
        
        <v-card v-for="tpl in templates" :key="tpl.id" color="surface" elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="text-h6 font-weight-bold text-wrap pt-4">{{ tpl.name }}</v-card-title>
          <v-card-subtitle class="mt-1">
            <v-chip size="x-small" color="primary" class="mr-1 mb-1">{{ tpl.level }}</v-chip>
            <v-chip size="x-small" color="secondary" class="mr-1 mb-1">{{ tpl.objective }}</v-chip>
            <v-chip size="x-small" color="info" variant="outlined" class="mb-1">{{ tpl.days }}x na semana</v-chip>
          </v-card-subtitle>
          
          <v-card-text class="mt-2">
            <p class="text-body-2 text-medium-emphasis mb-4">{{ tpl.description }}</p>
            
            <div class="font-weight-bold mb-2">Treinos Incluídos ({{ tpl.routines.length }}):</div>
            <v-expansion-panels variant="accordion" class="mb-4">
              <v-expansion-panel v-for="(rt, i) in tpl.routines" :key="i" class="bg-background">
                <v-expansion-panel-title class="font-weight-bold">{{ rt.name }}</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-chip
                    size="small"
                    class="mr-2 mb-2"
                    color="primary"
                    variant="tonal"
                    v-for="ex in rt.exercises"
                    :key="ex.id"
                    append-icon="mdi-information-outline"
                    @click="openGuide(ex.name)"
                    style="cursor: pointer;"
                  >
                    {{ ex.name }} ({{ ex.setsMax }}x{{ ex.repsMax }})
                  </v-chip>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
          
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="primary" variant="text" block @click="useTemplate(tpl)">
              Adicionar {{ tpl.routines.length }} treinos à minha biblioteca
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>
    </v-window>

    <v-snackbar v-model="snackbar" color="success" timeout="3000">
      Treinos importados com sucesso!
    </v-snackbar>

    <!-- Dialog de Guia de Execução -->
    <ExerciseGuideDialog v-model="guideDialog" :exercise-name="selectedExerciseForGuide" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { workoutTemplates } from '@/data/workoutTemplates';
import ExerciseGuideDialog from '@/components/ExerciseGuideDialog.vue';

const router = useRouter();
const store = useStore();

const tab = ref('wizard');
const guideDialog = ref(false);
const selectedExerciseForGuide = ref('');

const openGuide = (name) => {
  selectedExerciseForGuide.value = name;
  guideDialog.value = true;
};
const templates = ref(workoutTemplates);
const snackbar = ref(false);

const wizard = reactive({
  level: 'Iniciante',
  objective: 'Hipertrofia',
  days: 3
});

const suggestedTemplate = ref(null);

const goBack = () => {
  router.push('/workouts');
};

const generateSuggestion = () => {
  // Simples algoritmo de sugestão baseado em pontuação
  let bestMatch = null;
  let highestScore = -1;

  for (const tpl of templates.value) {
    let score = 0;
    if (tpl.level === wizard.level) score += 3;
    if (tpl.objective === wizard.objective) score += 2;
    if (tpl.days === wizard.days) score += 2;
    
    // Fallbacks
    if (wizard.level === 'Iniciante' && tpl.split === 'Corpo Todo') score += 2;
    if (wizard.level === 'Avançado' && tpl.split === 'PPL') score += 2;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = tpl;
    }
  }

  suggestedTemplate.value = bestMatch;
};

const useTemplate = async (template) => {
  if (template.isProgram && template.routines) {
    // Adiciona cada rotina do programa
    for (const rt of template.routines) {
      const newRoutine = {
        id: crypto.randomUUID(),
        name: rt.name,
        objective: template.objective,
        split: template.split,
        exercises: JSON.parse(JSON.stringify(rt.exercises))
      };
      await store.dispatch('workouts/addRoutine', newRoutine);
    }
  } else {
    // Código antigo de segurança caso ainda haja templates antigos
    const newRoutine = JSON.parse(JSON.stringify(template));
    newRoutine.id = crypto.randomUUID();
    delete newRoutine.description; 
    await store.dispatch('workouts/addRoutine', newRoutine);
  }

  snackbar.value = true;
  
  setTimeout(() => {
    router.push('/workouts');
  }, 1000);
};
</script>
