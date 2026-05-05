import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import WorkoutsView from '../views/WorkoutsView.vue';
import ActiveWorkoutView from '../views/ActiveWorkoutView.vue';
import CreateWorkoutView from '../views/CreateWorkoutView.vue';
import HistoryView from '../views/HistoryView.vue';
import GoalsView from '../views/GoalsView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: WorkoutsView
  },
  {
    path: '/workout/create',
    name: 'CreateWorkout',
    component: CreateWorkoutView
  },
  {
    path: '/workout/edit/:id',
    name: 'EditWorkout',
    component: CreateWorkoutView  // Reuses the same component in edit mode
  },
  {
    path: '/workout/:id',
    name: 'ActiveWorkout',
    component: ActiveWorkoutView
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView
  },
  {
    path: '/goals',
    name: 'Goals',
    component: GoalsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
