import { createStore } from 'vuex';
import auth from './modules/auth';
import workouts from './modules/workouts';
import history from './modules/history';
import goals from './modules/goals';
import gamification from './modules/gamification';
import body from './modules/body';

// Plugin para persistência de dados no localStorage (preparado para trocar para backend)
const localStoragePlugin = store => {
  // Load state from localStorage on init
  const savedState = localStorage.getItem('gymtrack_state');
  if (savedState) {
    try {
      store.replaceState(Object.assign({}, store.state, JSON.parse(savedState)));
    } catch (e) {
      console.error('Erro ao restaurar state do localStorage:', e);
    }
  }

  // Subscribe to mutations to save state
  store.subscribe((mutation, state) => {
    // We shouldn't save auth session here, let supabase handle it
    const stateToSave = { ...state };
    delete stateToSave.auth; 
    localStorage.setItem('gymtrack_state', JSON.stringify(stateToSave));
  });
};

export default createStore({
  modules: {
    auth,
    workouts,
    history,
    goals,
    gamification,
    body
  },
  plugins: [localStoragePlugin]
});
