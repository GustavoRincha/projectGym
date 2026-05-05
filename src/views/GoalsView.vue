<template>
  <div class="goals-view pb-16">
    <h1 class="text-h4 font-weight-bold mt-4 mb-4">Metas & Progresso</h1>

    <!-- Gamification card always visible at top -->
    <GamificationPanel></GamificationPanel>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" bg-color="surface" density="compact" show-arrows class="rounded-lg mb-4">
      <v-tab value="streak">🔥 Sequências</v-tab>
      <v-tab value="prs">🏆 PRs</v-tab>
      <v-tab value="volume">📦 Volume</v-tab>
      <v-tab value="body">⚖️ Corpo</v-tab>
      <v-tab value="notes">📝 Notas</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="streak">
        <StreakPanel></StreakPanel>
      </v-tabs-window-item>
      <v-tabs-window-item value="prs">
        <PRGoalsPanel></PRGoalsPanel>
      </v-tabs-window-item>
      <v-tabs-window-item value="volume">
        <VolumeGoalPanel></VolumeGoalPanel>
      </v-tabs-window-item>
      <v-tabs-window-item value="body">
        <BodyGoalsPanel></BodyGoalsPanel>
      </v-tabs-window-item>
      <v-tabs-window-item value="notes">
        <NotesPanel></NotesPanel>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GamificationPanel from '@/components/goals/GamificationPanel.vue';
import StreakPanel        from '@/components/goals/StreakPanel.vue';
import PRGoalsPanel       from '@/components/goals/PRGoalsPanel.vue';
import VolumeGoalPanel    from '@/components/goals/VolumeGoalPanel.vue';
import BodyGoalsPanel     from '@/components/goals/BodyGoalsPanel.vue';
import NotesPanel         from '@/components/goals/NotesPanel.vue';

const activeTab = ref('streak');
</script>
