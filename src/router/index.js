import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: () => import('../views/WorkoutsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/suggest',
    name: 'SuggestWorkout',
    component: () => import('../views/SuggestWorkoutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/create',
    name: 'CreateWorkout',
    component: () => import('../views/CreateWorkoutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/edit/:id',
    name: 'EditWorkout',
    component: () => import('../views/CreateWorkoutView.vue'), // Reuses the same component in edit mode
    meta: { requiresAuth: true }
  },
  {
    path: '/workout/:id',
    name: 'ActiveWorkout',
    component: () => import('../views/ActiveWorkoutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exercises',
    name: 'Exercises',
    component: () => import('../views/ExercisesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/goals',
    name: 'Goals',
    component: () => import('../views/GoalsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
