import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import HomeView from '../views/HomeView.vue';
import WorkoutsView from '../views/WorkoutsView.vue';
import ActiveWorkoutView from '../views/ActiveWorkoutView.vue';
import CreateWorkoutView from '../views/CreateWorkoutView.vue';
import HistoryView from '../views/HistoryView.vue';
import GoalsView from '../views/GoalsView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: WorkoutsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/create',
    name: 'CreateWorkout',
    component: CreateWorkoutView,
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/edit/:id',
    name: 'EditWorkout',
    component: CreateWorkoutView, // Reuses the same component in edit mode
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/:id',
    name: 'ActiveWorkout',
    component: ActiveWorkoutView,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView,
    meta: { requiresAuth: true }
  },
  {
    path: '/goals',
    name: 'Goals',
    component: GoalsView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Opcional: Se quiser garantir que a inicialização de auth ocorreu,
  // isso deve ser chamado. Por agora, confiamos que o App.vue o fará ou checamos o estado.
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  
  // Se a rota requer auth e não está logado, vai pro login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  // Se está logado e tenta ir pro login, vai pra home
  else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } 
  else {
    next();
  }
});

export default router;
