import { supabase } from '@/plugins/supabase';
import { syncService } from '@/services/syncService';

export default {
  namespaced: true,
  state: {
    // Text-based free goals (existing feature)
    goals: [],
    // Performance / PR goals
    performanceGoals: [
      { id: 'pr_demo', exercise: 'Supino Reto', targetWeight: 100, unit: 'kg' }
    ],
    // Volume goal
    volumeGoal: { target: 10000, period: 'weekly', unit: 'kg' },
    // Monthly challenge target
    monthlyChallenge: { target: 16 },
  },
  getters: {
    allGoals:         (s) => s.goals,
    performanceGoals: (s) => s.performanceGoals,
    volumeGoal:       (s) => s.volumeGoal,
    monthlyChallenge: (s) => s.monthlyChallenge,
  },
  mutations: {
    SET_ALL_GOALS(state, goals) {
      state.goals = goals;
    },
    // ── Free goals ──────────────────────────────────────────
    ADD_GOAL_FULL(state, goal) {
      // Evita duplicatas se o ID já existir
      if (!state.goals.find(g => g.id === goal.id)) {
        state.goals.push(goal);
      }
    },
    ADD_GOAL(state, title) {
      state.goals.push({ id: Date.now().toString(), title, comments: [] });
    },
    ADD_COMMENT(state, { goalId, text }) {
      const goal = state.goals.find(g => g.id === goalId);
      if (goal) goal.comments.push({ date: new Date().toISOString(), text });
    },
    DELETE_GOAL(state, id) {
      state.goals = state.goals.filter(g => g.id !== id);
    },
    // ── Performance / PR goals ───────────────────────────────
    ADD_PR_GOAL(state, goal) {
      state.performanceGoals.push({ ...goal, id: Date.now().toString() });
    },
    DELETE_PR_GOAL(state, id) {
      state.performanceGoals = state.performanceGoals.filter(g => g.id !== id);
    },
    // ── Volume goal ──────────────────────────────────────────
    SET_VOLUME_GOAL(state, payload) {
      state.volumeGoal = { ...state.volumeGoal, ...payload };
    },
    // ── Monthly challenge ────────────────────────────────────
    SET_MONTHLY_TARGET(state, target) {
      state.monthlyChallenge.target = target;
    },
  },
  actions: {
    async fetchGoals({ commit, rootState }) {
      const userId = rootState.auth?.user?.id;
      if (!userId) return;

      const { data } = await supabase.from('user_goals').select('*').eq('user_id', userId).single();
      if (data) {
        if (data.free_goals) {
          // Mutar diretamente o array para não sobrescrever a reatividade se usarmos push no frontend
          // Mas como não há mutation para SET_ALL_GOALS, vamos só preencher
          data.free_goals.forEach(g => commit('ADD_GOAL_FULL', g)); // Assumindo criação de uma mutation ADD_GOAL_FULL
        }
        if (data.pr_goals) {
          data.pr_goals.forEach(g => commit('ADD_PR_GOAL', { ...g, skipSync: true }));
        }
        if (data.volume_goal) commit('SET_VOLUME_GOAL', { ...data.volume_goal, skipSync: true });
        if (data.monthly_target) commit('SET_MONTHLY_TARGET', data.monthly_target);
      }
    },

    // ── Free goals ──────────────────────────────────────────
    addGoal({ commit, rootState, state }, title) { 
      commit('ADD_GOAL', title);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, free_goals: state.goals });
      syncService.processQueue();
    },
    addComment({ commit, rootState, state }, payload) { 
      commit('ADD_COMMENT', payload);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, free_goals: state.goals });
      syncService.processQueue();
    },
    deleteGoal({ commit, rootState, state }, id) { 
      commit('DELETE_GOAL', id);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, free_goals: state.goals });
      syncService.processQueue();
    },

    // ── Performance / PR goals ───────────────────────────────
    addPrGoal({ commit, rootState, state }, goal) { 
      commit('ADD_PR_GOAL', goal);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, pr_goals: state.performanceGoals });
      syncService.processQueue();
    },
    deletePrGoal({ commit, rootState, state }, id) { 
      commit('DELETE_PR_GOAL', id);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, pr_goals: state.performanceGoals });
      syncService.processQueue();
    },

    // ── Volume & Monthly ─────────────────────────────────────
    setVolumeGoal({ commit, rootState, state }, payload) { 
      commit('SET_VOLUME_GOAL', payload);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, volume_goal: state.volumeGoal });
      syncService.processQueue();
    },
    setMonthlyTarget({ commit, rootState, state }, target) { 
      commit('SET_MONTHLY_TARGET', target);
      syncService.addToQueue('UPDATE_GOALS', { user_id: rootState.auth?.user?.id, monthly_target: state.monthlyChallenge.target });
      syncService.processQueue();
    },
  },
};
