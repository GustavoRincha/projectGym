<template>
  <div class="goals-view pb-16">
    <h1 class="text-h4 font-weight-bold mt-4 mb-4">Estatísticas & Analytics</h1>

    <!-- Botões de Troca de Guia -->
    <v-row class="mb-4">
      <v-col cols="4" class="pa-1">
        <v-btn
          block
          :variant="activeTab === 'body' ? 'flat' : 'tonal'"
          :color="activeTab === 'body' ? 'primary' : 'on-surface'"
          class="rounded-xl text-none font-weight-bold text-caption text-sm-body-2 py-2 border-thin"
          height="48"
          @click="activeTab = 'body'"
        >
          ⚖️ Evolução
        </v-btn>
      </v-col>
      <v-col cols="4" class="pa-1">
        <v-btn
          block
          :variant="activeTab === 'performance' ? 'flat' : 'tonal'"
          :color="activeTab === 'performance' ? 'primary' : 'on-surface'"
          class="rounded-xl text-none font-weight-bold text-caption text-sm-body-2 py-2 border-thin"
          height="48"
          @click="activeTab = 'performance'"
        >
          🏋️ Desempenho
        </v-btn>
      </v-col>
      <v-col cols="4" class="pa-1">
        <v-btn
          block
          :variant="activeTab === 'diet' ? 'flat' : 'tonal'"
          :color="activeTab === 'diet' ? 'primary' : 'on-surface'"
          class="rounded-xl text-none font-weight-bold text-caption text-sm-body-2 py-2 border-thin"
          height="48"
          @click="activeTab = 'diet'"
        >
          🍎 Dieta
        </v-btn>
      </v-col>
    </v-row>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="body">
        <BodyGoalsPanel></BodyGoalsPanel>
      </v-tabs-window-item>
      
      <v-tabs-window-item value="performance">
        <WorkoutPerformancePanel></WorkoutPerformancePanel>
      </v-tabs-window-item>

      <v-tabs-window-item value="diet">
        <DietPanel></DietPanel>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BodyGoalsPanel from '@/components/goals/BodyGoalsPanel.vue';
import WorkoutPerformancePanel from '@/components/goals/WorkoutPerformancePanel.vue';
import DietPanel from '@/components/goals/DietPanel.vue';

const activeTab = ref('body');
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.v-theme--gymLight .border-thin {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}
</style>
