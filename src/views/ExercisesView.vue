<template>
  <div class="exercises-view pb-16">
    <!-- Título Principal -->
    <v-row class="mt-4 mb-2">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <h1 class="text-h4 font-weight-bold text-white">Exercícios</h1>
      </v-col>
    </v-row>

    <!-- Barra de Pesquisa -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Buscar exercício..."
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          color="primary"
          bg-color="surface"
          class="search-bar rounded-xl"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Tabs para alternar (Apenas se não houver pesquisa e não estiver dentro de um grupo) -->
    <v-row class="mb-6" v-if="!searchQuery.trim() && !selectedGroup">
      <v-col cols="12">
        <v-btn-toggle
          v-model="activeTab"
          mandatory
          color="primary"
          variant="tonal"
          rounded="pill"
          density="comfortable"
          class="d-flex w-100"
        >
          <v-btn value="body_part" class="flex-grow-1 text-subtitle-2 font-weight-bold">
            <v-icon icon="mdi-arm-flex" class="mr-2"></v-icon>Parte do Corpo
          </v-btn>
          <v-btn value="equipment" class="flex-grow-1 text-subtitle-2 font-weight-bold">
            <v-icon icon="mdi-dumbbell" class="mr-2"></v-icon>Equipamento
          </v-btn>
          <v-btn value="favorites" class="flex-grow-1 text-subtitle-2 font-weight-bold">
            <v-icon icon="mdi-star" class="mr-2"></v-icon>Favoritos
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <div v-if="loading" class="d-flex flex-column align-center justify-center py-12">
      <v-progress-circular indeterminate color="primary" size="50" class="mb-4"></v-progress-circular>
      <p class="text-caption text-medium-emphasis">Carregando catálogo de exercícios...</p>
    </div>

    <!-- Estado sem pesquisa -->
    <template v-else-if="!searchQuery.trim()">
      
      <!-- ABA FAVORITOS -->
      <template v-if="activeTab === 'favorites'">
        <v-row v-if="displayedExercises.length > 0">
          <v-col cols="12">
            <h2 class="text-h6 font-weight-bold text-white mb-2 d-flex align-center">
              <v-icon icon="mdi-star" color="amber-darken-1" class="mr-2"></v-icon>
              Meus Exercícios Favoritos
              <v-chip size="small" class="ml-2 font-weight-bold bg-primary-light text-primary border-none">
                {{ filteredExercises.length }}
              </v-chip>
            </h2>
          </v-col>

          <v-col 
            cols="6" 
            sm="4" 
            md="3"
            v-for="ex in displayedExercises" 
            :key="ex.id"
            class="pa-2"
          >
            <v-card 
              color="surface" 
              elevation="2" 
              rounded="xl"
              class="exercise-grid-card hover-card overflow-hidden d-flex flex-column h-100"
              @click="openGuide(ex.name)"
            >
              <!-- Área da Imagem (Fundo Branco) -->
              <div class="image-area position-relative bg-white d-flex align-center justify-center pa-2">
                <v-img
                  v-if="ex.image"
                  :src="getImageUrl(ex.image)"
                  height="130"
                  contain
                  alt="Exercício"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-white">
                      <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                <div v-else class="d-flex align-center justify-center" style="height: 130px; width: 100%;">
                  <v-icon icon="mdi-image-off-outline" color="grey-lighten-1" size="large"></v-icon>
                </div>
                
                <!-- Botão de Estrela (Favoritos) -->
                <v-btn
                  icon
                  variant="flat"
                  color="rgba(0, 0, 0, 0.25)"
                  size="x-small"
                  class="favorite-btn position-absolute"
                  style="top: 8px; right: 8px; z-index: 10;"
                  @click.stop="toggleFavorite(ex.id)"
                >
                  <v-icon 
                    :icon="isFavorite(ex.id) ? 'mdi-star' : 'mdi-star-outline'" 
                    :color="isFavorite(ex.id) ? 'amber-darken-1' : 'white'"
                    size="small"
                  ></v-icon>
                </v-btn>
              </div>
              
              <!-- Texto inferior (Nome e Músculo) -->
              <div class="text-area pa-3 d-flex flex-column justify-center flex-grow-1">
                <span class="text-body-2 font-weight-bold text-white leading-tight mb-1" style="min-height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
                  {{ ex.name }}
                </span>
                <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis mt-auto">
                  <span class="text-truncate mr-1">{{ translate(ex.muscle_group || ex.target) }}</span>
                  <v-icon icon="mdi-arrow-right" size="x-small" color="primary"></v-icon>
                </div>
              </div>
            </v-card>
          </v-col>
          
          <v-col cols="12" v-if="hasMore" class="mt-4">
            <v-btn
              block
              variant="tonal"
              color="primary"
              class="rounded-pill text-none font-weight-bold"
              @click="loadMore"
            >
              Carregar Mais Exercícios
            </v-btn>
          </v-col>
        </v-row>
        <div v-else class="text-center py-12">
          <v-icon icon="mdi-star-outline" size="64" class="text-medium-emphasis mb-4"></v-icon>
          <h3 class="text-h6 text-medium-emphasis font-weight-medium">Nenhum exercício favoritado ainda.</h3>
          <p class="text-caption text-medium-emphasis mt-2">Clique na estrela nos cards dos exercícios para favoritá-los.</p>
        </div>
      </template>

      <!-- ABAS PARTE DO CORPO E EQUIPAMENTO -->
      <template v-else>
        <!-- Grade de Categorias / Grupos -->
        <template v-if="!selectedGroup">
          <v-row>
            <v-col 
              cols="6" 
              sm="4" 
              v-for="group in (activeTab === 'body_part' ? bodyPartGroups : equipmentGroups)" 
              :key="group.name"
            >
              <v-card
                class="group-card pa-2 pa-sm-4 rounded-xl d-flex flex-column align-center justify-center hover-card cursor-pointer"
                :style="{ background: group.gradient }"
                @click="selectedGroup = group.name"
              >
                <v-icon :icon="group.icon" size="32" color="primary" class="mb-2 mb-sm-3 group-icon-animate"></v-icon>
                <span class="text-body-2 text-sm-body-1 font-weight-bold text-center text-white w-100" style="word-break: break-word; line-height: 1.25;">{{ group.name }}</span>
                <span class="text-caption text-medium-emphasis mt-1">{{ group.count }} ex</span>
              </v-card>
            </v-col>
          </v-row>
        </template>

        <!-- Visualização dos Exercícios do Grupo Selecionado -->
        <template v-else>
          <v-row class="mb-4">
            <v-col cols="12" class="d-flex align-center">
              <v-btn 
                variant="text" 
                color="primary" 
                prepend-icon="mdi-arrow-left" 
                class="text-none font-weight-bold pl-0"
                @click="selectedGroup = null"
              >
                Voltar para categorias
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <h2 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center">
                <v-icon :icon="activeTab === 'body_part' ? 'mdi-arm-flex' : 'mdi-dumbbell'" color="primary" class="mr-2"></v-icon>
                {{ selectedGroup }}
                <v-chip size="small" class="ml-2 font-weight-bold bg-primary-light text-primary border-none">
                  {{ filteredExercises.length }}
                </v-chip>
              </h2>
            </v-col>

            <v-col 
              cols="6" 
              sm="4" 
              md="3"
              v-for="ex in displayedExercises" 
              :key="ex.id"
              class="pa-2"
            >
              <v-card 
                color="surface" 
                elevation="2" 
                rounded="xl"
                class="exercise-grid-card hover-card overflow-hidden d-flex flex-column h-100"
                @click="openGuide(ex.name)"
              >
                <!-- Área da Imagem (Fundo Branco) -->
                <div class="image-area position-relative bg-white d-flex align-center justify-center pa-2">
                  <v-img
                    v-if="ex.image"
                    :src="getImageUrl(ex.image)"
                    height="130"
                    contain
                    alt="Exercício"
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-white">
                        <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
                      </div>
                    </template>
                  </v-img>
                  <div v-else class="d-flex align-center justify-center" style="height: 130px; width: 100%;">
                    <v-icon icon="mdi-image-off-outline" color="grey-lighten-1" size="large"></v-icon>
                  </div>
                  
                  <!-- Botão de Estrela (Favoritos) -->
                  <v-btn
                    icon
                    variant="flat"
                    color="rgba(0, 0, 0, 0.25)"
                    size="x-small"
                    class="favorite-btn position-absolute"
                    style="top: 8px; right: 8px; z-index: 10;"
                    @click.stop="toggleFavorite(ex.id)"
                  >
                    <v-icon 
                      :icon="isFavorite(ex.id) ? 'mdi-star' : 'mdi-star-outline'" 
                      :color="isFavorite(ex.id) ? 'amber-darken-1' : 'white'"
                      size="small"
                    ></v-icon>
                  </v-btn>
                </div>
                
                <!-- Texto inferior (Nome e Músculo) -->
                <div class="text-area pa-3 d-flex flex-column justify-center flex-grow-1">
                  <span class="text-body-2 font-weight-bold text-white leading-tight mb-1" style="min-height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
                    {{ ex.name }}
                  </span>
                  <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis mt-auto">
                    <span class="text-truncate mr-1">{{ translate(ex.muscle_group || ex.target) }}</span>
                    <v-icon icon="mdi-arrow-right" size="x-small" color="primary"></v-icon>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" v-if="hasMore" class="mt-4">
              <v-btn
                block
                variant="tonal"
                color="primary"
                class="rounded-pill text-none font-weight-bold"
                @click="loadMore"
              >
                Carregar Mais Exercícios
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </template>

    </template>

    <!-- Estado com pesquisa ativa -->
    <template v-else>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h6 font-weight-bold text-white">Resultados da busca</h2>
            <v-chip size="small" color="primary" class="font-weight-bold">
              {{ filteredExercises.length }} encontrados
            </v-chip>
          </div>
        </v-col>

        <template v-if="filteredExercises.length > 0">
          <v-col 
            cols="6" 
            sm="4" 
            md="3"
            v-for="ex in displayedExercises" 
            :key="ex.id"
            class="pa-2"
          >
            <v-card 
              color="surface" 
              elevation="2" 
              rounded="xl"
              class="exercise-grid-card hover-card overflow-hidden d-flex flex-column h-100"
              @click="openGuide(ex.name)"
            >
              <!-- Área da Imagem (Fundo Branco) -->
              <div class="image-area position-relative bg-white d-flex align-center justify-center pa-2">
                <v-img
                  v-if="ex.image"
                  :src="getImageUrl(ex.image)"
                  height="130"
                  contain
                  alt="Exercício"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-white">
                      <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                <div v-else class="d-flex align-center justify-center" style="height: 130px; width: 100%;">
                  <v-icon icon="mdi-image-off-outline" color="grey-lighten-1" size="large"></v-icon>
                </div>
                
                <!-- Botão de Estrela (Favoritos) -->
                <v-btn
                  icon
                  variant="flat"
                  color="rgba(0, 0, 0, 0.25)"
                  size="x-small"
                  class="favorite-btn position-absolute"
                  style="top: 8px; right: 8px; z-index: 10;"
                  @click.stop="toggleFavorite(ex.id)"
                >
                  <v-icon 
                    :icon="isFavorite(ex.id) ? 'mdi-star' : 'mdi-star-outline'" 
                    :color="isFavorite(ex.id) ? 'amber-darken-1' : 'white'"
                    size="small"
                  ></v-icon>
                </v-btn>
              </div>
              
              <!-- Texto inferior (Nome e Músculo) -->
              <div class="text-area pa-3 d-flex flex-column justify-center flex-grow-1">
                <span class="text-body-2 font-weight-bold text-white leading-tight mb-1" style="min-height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
                  {{ ex.name }}
                </span>
                <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis mt-auto">
                  <span class="text-truncate mr-1">{{ translate(ex.muscle_group || ex.target) }}</span>
                  <v-icon icon="mdi-arrow-right" size="x-small" color="primary"></v-icon>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" v-if="hasMore" class="mt-4">
            <v-btn
              block
              variant="tonal"
              color="primary"
              class="rounded-pill text-none font-weight-bold"
              @click="loadMore"
            >
              Carregar Mais Exercícios
            </v-btn>
          </v-col>
        </template>

        <v-col cols="12" v-else class="text-center py-12">
          <v-icon icon="mdi-alert-circle-outline" size="64" class="text-medium-emphasis mb-4"></v-icon>
          <h3 class="text-h6 text-medium-emphasis font-weight-medium">Nenhum exercício encontrado para "{{ searchQuery }}".</h3>
        </v-col>
      </v-row>
    </template>

    <!-- Dialog de Guia de Execução -->
    <ExerciseGuideDialog v-model="guideDialog" :exercise-name="selectedExerciseForGuide" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getExercises, TRANSLATIONS, MEDIA_BASE_URL } from '@/services/exerciseDatabaseService';
import ExerciseGuideDialog from '@/components/ExerciseGuideDialog.vue';

const allExercises = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const activeTab = ref('body_part'); // 'body_part' | 'equipment' | 'favorites'
const selectedGroup = ref(null);
const visibleLimit = ref(20);
const favorites = ref(new Set());

const guideDialog = ref(false);
const selectedExerciseForGuide = ref('');

const openGuide = (name) => {
  selectedExerciseForGuide.value = name;
  guideDialog.value = true;
};

// Resetar o limite de exibição ao mudar filtros/busca
watch([selectedGroup, searchQuery, activeTab], () => {
  visibleLimit.value = 20;
});

// Gerenciamento de Favoritos localmente
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('gym_favorite_exercises');
    if (saved) {
      favorites.value = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.error('Erro ao ler favoritos do localStorage:', e);
  }
};

const saveFavorites = () => {
  try {
    localStorage.setItem('gym_favorite_exercises', JSON.stringify(Array.from(favorites.value)));
  } catch (e) {
    console.error('Erro ao salvar favoritos no localStorage:', e);
  }
};

const toggleFavorite = (id) => {
  if (favorites.value.has(id)) {
    favorites.value.delete(id);
  } else {
    favorites.value.add(id);
  }
  saveFavorites();
};

const isFavorite = (id) => {
  return favorites.value.has(id);
};

onMounted(async () => {
  loading.value = true;
  loadFavorites();
  try {
    const raw = await getExercises();
    allExercises.value = raw.map(ex => ({
      ...ex,
      name: ex.name ? ex.name.charAt(0).toUpperCase() + ex.name.slice(1) : ''
    }));
  } catch (err) {
    console.error('Erro ao carregar lista de exercícios:', err);
  } finally {
    loading.value = false;
  }
});

// Obter a URL da imagem a partir do caminho estático
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${MEDIA_BASE_URL}${imagePath}`;
};

// Tradutor
const translate = (text) => {
  if (!text) return '';
  return TRANSLATIONS[text.toLowerCase()] || text;
};

// Mapeamentos de agrupamento limpos em Português
const CATEGORY_MAP = {
  'abdome': 'Abdômen', 'abs': 'Abdômen', 'cintura': 'Abdômen', 'obliques': 'Abdômen', 'waist': 'Abdômen',
  'peito': 'Peito', 'peitoral': 'Peito', 'chest': 'Peito', 'pectoralis': 'Peito',
  'costas': 'Costas', 'back': 'Costas', 'dorsais': 'Costas', 'upper back': 'Costas', 'lower back': 'Costas', 'lombar': 'Costas',
  'braços': 'Braços', 'biceps': 'Braços', 'triceps': 'Braços', 'forearms': 'Braços', 'antebraços': 'Braços', 'lower arms': 'Braços', 'upper arms': 'Braços', 'bíceps': 'Braços', 'tríceps': 'Braços',
  'ombros': 'Ombros', 'delts': 'Ombros', 'shoulders': 'Ombros', 'deltoides': 'Ombros',
  'coxas': 'Pernas', 'pernas': 'Pernas', 'panturrilhas': 'Pernas', 'panturrilhas / pernas': 'Pernas', 'calves': 'Pernas', 'adductors': 'Pernas', 'abductors': 'Pernas', 'hamstrings': 'Pernas', 'quads': 'Pernas', 'quadríceps': 'Pernas', 'upper legs': 'Pernas', 'lower legs': 'Pernas',
  'cardio': 'Cardio',
  'pescoço': 'Pescoço', 'neck': 'Pescoço'
};

const getNormalizedCategory = (ex) => {
  const bp = (ex.body_part || '').toLowerCase();
  const cat = (ex.category || '').toLowerCase();
  return CATEGORY_MAP[bp] || CATEGORY_MAP[cat] || 'Outros';
};

const EQUIPMENT_MAP = {
  'peso corporal': 'Peso Corporal', 'body weight': 'Peso Corporal', 'weighted': 'Peso Corporal', 'com carga': 'Peso Corporal',
  'barra': 'Barra', 'barbell': 'Barra', 'barra olímpica': 'Barra',
  'halter': 'Halteres', 'haltere': 'Halteres', 'dumbbell': 'Halteres',
  'polia': 'Polia / Cabo', 'polia / cabo': 'Polia / Cabo', 'cable': 'Polia / Cabo', 'crossover': 'Polia / Cabo',
  'máquina': 'Máquina', 'aparelho de alavanca': 'Máquina', 'leverage machine': 'Máquina', 'máquina de agachamento hack': 'Máquina', 'máquina articulada': 'Máquina', 'smith machine': 'Máquina', 'barra guiada (smith)': 'Máquina', 'sled machine': 'Máquina',
  'kettlebell': 'Kettlebell',
  'elástico': 'Elásticos', 'faixa de resistência': 'Elásticos', 'elástico / faixa de resistência': 'Elásticos', 'band': 'Elásticos',
  'bola': 'Bola', 'bola medicinal': 'Bola', 'medicine ball': 'Bola', 'bola de estabilidade': 'Bola', 'stability ball': 'Bola', 'bola de pilates': 'Bola', 'bola bosu': 'Bola', 'bosu ball': 'Bola',
  'barra ez': 'Outros', 'ez barbell': 'Outros', 'corda': 'Outros', 'rope': 'Outros', 'roller': 'Outros', 'wheel roller': 'Outros', 'stationary bike': 'Outros', 'skierg machine': 'Outros', 'elliptical machine': 'Outros', 'stepmill machine': 'Outros', 'trap bar': 'Outros'
};

const getNormalizedEquipment = (ex) => {
  const eq = (ex.equipment || '').toLowerCase();
  return EQUIPMENT_MAP[eq] || 'Outros';
};

// Gradients e ícones para visualizações ricas em design
const getCategoryGradient = (name) => {
  const gradients = {
    'Peito': 'linear-gradient(135deg, rgba(255, 23, 68, 0.15) 0%, rgba(255, 23, 68, 0.05) 100%)',
    'Costas': 'linear-gradient(135deg, rgba(41, 121, 255, 0.15) 0%, rgba(41, 121, 255, 0.05) 100%)',
    'Braços': 'linear-gradient(135deg, rgba(0, 230, 118, 0.15) 0%, rgba(0, 230, 118, 0.05) 100%)',
    'Ombros': 'linear-gradient(135deg, rgba(255, 145, 0, 0.15) 0%, rgba(255, 145, 0, 0.05) 100%)',
    'Pernas': 'linear-gradient(135deg, rgba(213, 0, 249, 0.15) 0%, rgba(213, 0, 249, 0.05) 100%)',
    'Abdômen': 'linear-gradient(135deg, rgba(0, 176, 255, 0.15) 0%, rgba(0, 176, 255, 0.05) 100%)',
    'Cardio': 'linear-gradient(135deg, rgba(245, 0, 87, 0.15) 0%, rgba(245, 0, 87, 0.05) 100%)'
  };
  return gradients[name] || 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)';
};

const getCategoryIcon = (name) => {
  const icons = {
    'Peito': 'mdi-ellipse-outline',
    'Costas': 'mdi-arrow-up-bold-box-outline',
    'Braços': 'mdi-arm-flex',
    'Ombros': 'mdi-triangle-outline',
    'Pernas': 'mdi-run',
    'Abdômen': 'mdi-grid',
    'Cardio': 'mdi-heart-pulse'
  };
  return icons[name] || 'mdi-dumbbell';
};

const getEquipmentGradient = (name) => {
  const gradients = {
    'Peso Corporal': 'linear-gradient(135deg, rgba(0, 230, 118, 0.12) 0%, rgba(0, 230, 118, 0.03) 100%)',
    'Barra': 'linear-gradient(135deg, rgba(255, 23, 68, 0.12) 0%, rgba(255, 23, 68, 0.03) 100%)',
    'Halteres': 'linear-gradient(135deg, rgba(41, 121, 255, 0.12) 0%, rgba(41, 121, 255, 0.03) 100%)',
    'Polia / Cabo': 'linear-gradient(135deg, rgba(255, 145, 0, 0.12) 0%, rgba(255, 145, 0, 0.03) 100%)',
    'Máquina': 'linear-gradient(135deg, rgba(0, 176, 255, 0.12) 0%, rgba(0, 176, 255, 0.03) 100%)',
    'Kettlebell': 'linear-gradient(135deg, rgba(213, 0, 249, 0.12) 0%, rgba(213, 0, 249, 0.03) 100%)',
    'Elásticos': 'linear-gradient(135deg, rgba(245, 0, 87, 0.12) 0%, rgba(245, 0, 87, 0.03) 100%)'
  };
  return gradients[name] || 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)';
};

const getEquipmentIcon = (name) => {
  const icons = {
    'Peso Corporal': 'mdi-human',
    'Barra': 'mdi-dumbbell',
    'Halteres': 'mdi-dumbbell',
    'Polia / Cabo': 'mdi-swap-vertical',
    'Máquina': 'mdi-engine-outline',
    'Kettlebell': 'mdi-kettlebell',
    'Elásticos': 'mdi-vector-line',
    'Bola': 'mdi-soccer'
  };
  return icons[name] || 'mdi-hammer';
};

// Contadores e Listagem das Categorias
const bodyPartGroups = computed(() => {
  const counts = {};
  allExercises.value.forEach(ex => {
    const cat = getNormalizedCategory(ex);
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.keys(counts).map(name => ({
    name,
    count: counts[name],
    gradient: getCategoryGradient(name),
    icon: getCategoryIcon(name)
  })).sort((a, b) => b.count - a.count);
});

const equipmentGroups = computed(() => {
  const counts = {};
  allExercises.value.forEach(ex => {
    const eq = getNormalizedEquipment(ex);
    counts[eq] = (counts[eq] || 0) + 1;
  });
  return Object.keys(counts).map(name => ({
    name,
    count: counts[name],
    gradient: getEquipmentGradient(name),
    icon: getEquipmentIcon(name)
  })).sort((a, b) => b.count - a.count);
});

// Exercícios filtrados
const filteredExercises = computed(() => {
  let list = allExercises.value;

  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(ex => 
      (ex.name && ex.name.toLowerCase().includes(q)) || 
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(q)) || 
      (ex.target && ex.target.toLowerCase().includes(q)) || 
      (ex.equipment && ex.equipment.toLowerCase().includes(q))
    );
    if (activeTab.value === 'favorites') {
      list = list.filter(ex => favorites.value.has(ex.id));
    }
  } else if (activeTab.value === 'favorites') {
    list = list.filter(ex => favorites.value.has(ex.id));
  } else if (selectedGroup.value) {
    if (activeTab.value === 'body_part') {
      list = list.filter(ex => getNormalizedCategory(ex) === selectedGroup.value);
    } else {
      list = list.filter(ex => getNormalizedEquipment(ex) === selectedGroup.value);
    }
  } else {
    return [];
  }

  return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
});

const displayedExercises = computed(() => {
  return filteredExercises.value.slice(0, visibleLimit.value);
});

const hasMore = computed(() => {
  return filteredExercises.value.length > visibleLimit.value;
});

const loadMore = () => {
  visibleLimit.value += 20;
};
</script>

<style scoped>
.hover-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.hover-card:hover {
  transform: translateY(-3px);
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 10px 20px rgba(0, 230, 118, 0.08) !important;
}

.group-card {
  min-height: 110px;
  height: auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.group-card:hover {
  transform: scale(1.05);
}

.group-card:hover .group-icon-animate {
  transform: scale(1.15) rotate(5deg);
  color: #FFFFFF !important;
}

.group-icon-animate {
  transition: transform 0.3s ease;
}

.exercise-grid-card {
  height: 220px;
  background-color: #0d1b22 !important; /* Fundo escuro premium como no mockup */
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.image-area {
  height: 146px;
  background-color: #FFFFFF !important; /* Área da imagem inteiramente branca */
  flex-shrink: 0;
}

.text-area {
  background-color: rgba(13, 27, 34, 0.5) !important; /* Degradê escuro embaixo */
}

.favorite-btn {
  background-color: rgba(0, 0, 0, 0.35) !important;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.border-light-trans {
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.bg-primary-light {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
}
</style>
