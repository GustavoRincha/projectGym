<template>
  <v-card color="surface" elevation="3" rounded="xl" class="mb-4 overflow-hidden">
    <!-- Level Banner -->
    <div class="level-banner pa-4 d-flex align-center justify-space-between">
      <div>
        <div class="text-caption text-medium-emphasis mb-1">Seu Nível</div>
        <div class="text-h5 font-weight-bold">{{ level.icon }} {{ level.name }}</div>
        <div class="text-caption text-medium-emphasis mt-1">{{ xp }} XP total</div>
      </div>
      <div class="text-right">
        <div class="text-caption text-medium-emphasis mb-1">
          {{ level.nextXp ? `${xpToNextLevel} XP para o próximo nível` : 'Nível Máximo! 🏆' }}
        </div>
        <v-progress-linear
          :model-value="levelProgress"
          color="primary"
          bg-color="background"
          rounded
          height="10"
          style="width: 150px"
        ></v-progress-linear>
        <div class="text-caption text-primary font-weight-bold mt-1">{{ levelProgress }}%</div>
      </div>
    </div>

    <!-- Badges -->
    <v-divider></v-divider>
    <div class="pa-4">
      <div class="text-subtitle-2 font-weight-bold mb-3">
        Conquistas ({{ unlockedCount }}/{{ allBadges.length }})
      </div>
      <div class="badges-grid">
        <v-tooltip v-for="badge in allBadges" :key="badge.id" :text="badge.unlocked ? `${badge.name} — ${badge.description}` : `🔒 ${badge.description}`" location="top">
          <template v-slot:activator="{ props }">
            <div
              v-bind="props"
              class="badge-item text-center"
              :class="{ 'badge-locked': !badge.unlocked }"
            >
              <div class="badge-icon text-h5">{{ badge.icon }}</div>
              <div class="text-caption badge-label">{{ badge.name }}</div>
              <div class="text-caption text-medium-emphasis" v-if="badge.unlocked && badge.unlockedAt">
                {{ formatDate(badge.unlockedAt) }}
              </div>
            </div>
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Rarity Legend -->
    <v-divider></v-divider>
    <div class="pa-3 d-flex flex-wrap gap-2">
      <v-chip v-for="r in rarities" :key="r.value" size="x-small" :color="r.color" variant="tonal">{{ r.label }}</v-chip>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const xp              = computed(() => store.getters['gamification/xp']);
const level           = computed(() => store.getters['gamification/level']);
const levelProgress   = computed(() => store.getters['gamification/levelProgress']);
const xpToNextLevel   = computed(() => store.getters['gamification/xpToNextLevel']);
const allBadges       = computed(() => store.getters['gamification/allBadges']);
const unlockedCount   = computed(() => allBadges.value.filter(b => b.unlocked).length);

const rarities = [
  { value: 'common',    label: '⬜ Comum',    color: 'default'  },
  { value: 'rare',      label: '🔵 Raro',     color: 'info'     },
  { value: 'epic',      label: '🟣 Épico',    color: 'secondary'},
  { value: 'legendary', label: '🟡 Lendário', color: 'warning'  },
];

const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR');
</script>

<style scoped>
.level-banner {
  background: linear-gradient(135deg, #1E1E1E 0%, #2a2a2a 100%);
  border-bottom: 2px solid #00E676;
}
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}
.badge-item {
  padding: 8px 4px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  transition: all 0.2s;
  cursor: default;
}
.badge-item:hover {
  background: rgba(0, 230, 118, 0.08);
}
.badge-locked {
  opacity: 0.3;
  filter: grayscale(100%);
}
.badge-icon {
  line-height: 1.5;
}
.badge-label {
  font-size: 10px !important;
  line-height: 1.2;
  margin-top: 2px;
}
</style>
