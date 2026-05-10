<template>
  <v-app>
    <v-app-bar v-if="isAuthenticated" color="background" elevation="0" border>
      <v-app-bar-title class="text-primary font-weight-bold">
        <v-icon icon="mdi-dumbbell" class="mr-2"></v-icon>
        Gym Track
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container class="pb-16" fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation v-if="isAuthenticated" bg-color="surface" color="primary" grow shift app>
      <v-btn to="/" value="home">
        <v-icon>mdi-home</v-icon>
        <span>Início</span>
      </v-btn>

      <v-btn to="/workouts" value="workouts">
        <v-icon>mdi-format-list-bulleted</v-icon>
        <span>Treinos</span>
      </v-btn>

      <v-btn to="/history" value="history">
        <v-icon>mdi-history</v-icon>
        <span>Histórico</span>
      </v-btn>

      <v-btn to="/goals" value="goals">
        <v-icon>mdi-target</v-icon>
        <span>Metas</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

const fetchUserWorkouts = () => {
  if (isAuthenticated.value) {
    store.dispatch('workouts/fetchRoutines');
  }
};

onMounted(() => {
  fetchUserWorkouts();
});

watch(isAuthenticated, (newVal) => {
  if (newVal) {
    fetchUserWorkouts();
  }
});

const logout = async () => {
  await store.dispatch('auth/logout');
  router.push('/login');
};
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #121212;
}
/* Ensure the active button in bottom nav has more emphasis */
.v-bottom-navigation .v-btn--active {
  color: #00E676 !important;
}
</style>
