<template>
  <v-app>
    <v-app-bar color="background" elevation="0" border>
      <v-app-bar-title class="text-primary font-weight-bold">
        <v-icon icon="mdi-dumbbell" class="mr-2"></v-icon>
        Gym Track
      </v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container class="pb-16" fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation bg-color="surface" color="primary" grow shift app>
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
// Main Application Component
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
