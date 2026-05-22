<template>
  <div class="goals-view pb-16">
    <h1 class="text-h4 font-weight-bold mt-4 mb-4">Estatísticas & Analytics</h1>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" bg-color="surface" density="compact" show-arrows class="rounded-lg mb-4">
      <v-tab value="body">⚖️ Evolução Corporal</v-tab>
      <v-tab value="performance">🏋️ Desempenho dos Treinos</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="body">
        <BodyGoalsPanel></BodyGoalsPanel>
      </v-tabs-window-item>
      
      <v-tabs-window-item value="performance">
        <WorkoutPerformancePanel></WorkoutPerformancePanel>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BodyGoalsPanel from '@/components/goals/BodyGoalsPanel.vue';
import WorkoutPerformancePanel from '@/components/goals/WorkoutPerformancePanel.vue';

const activeTab = ref('body');
</script>
