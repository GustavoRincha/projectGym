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
    // ── Free goals ──────────────────────────────────────────
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
    addGoal({ commit }, title)          { commit('ADD_GOAL', title); },
    addComment({ commit }, payload)     { commit('ADD_COMMENT', payload); },
    deleteGoal({ commit }, id)          { commit('DELETE_GOAL', id); },
    addPrGoal({ commit }, goal)         { commit('ADD_PR_GOAL', goal); },
    deletePrGoal({ commit }, id)        { commit('DELETE_PR_GOAL', id); },
    setVolumeGoal({ commit }, payload)  { commit('SET_VOLUME_GOAL', payload); },
    setMonthlyTarget({ commit }, target){ commit('SET_MONTHLY_TARGET', target); },
  },
};
