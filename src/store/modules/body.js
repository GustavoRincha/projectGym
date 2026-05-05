export default {
  namespaced: true,
  state: {
    weightLog:    [], // [{ date: ISO, value: number }]
    bfLog:        [], // [{ date: ISO, value: number }]
    measurements: [], // [{ date, arm, waist, chest, thigh, hip }]
    goals: {
      targetWeight:   null,
      weightGoalType: 'lose', // 'lose' | 'gain'
      targetBf:       null,
      targetArm:      null,
      targetWaist:    null,
      targetChest:    null,
      targetThigh:    null,
      targetHip:      null,
    },
  },
  getters: {
    weightLog:    (s) => s.weightLog,
    bfLog:        (s) => s.bfLog,
    measurements: (s) => s.measurements,
    goals:        (s) => s.goals,
    lastWeight:   (s) => s.weightLog.length ? [...s.weightLog].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null,
    lastBf:       (s) => s.bfLog.length    ? [...s.bfLog].sort((a, b) => new Date(b.date) - new Date(a.date))[0]    : null,
  },
  mutations: {
    LOG_WEIGHT(state, { date, value }) {
      state.weightLog.push({ date, value: parseFloat(value) });
      state.weightLog.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    LOG_BF(state, { date, value }) {
      state.bfLog.push({ date, value: parseFloat(value) });
      state.bfLog.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    LOG_MEASUREMENT(state, entry) {
      state.measurements.push(entry);
      state.measurements.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    SET_GOALS(state, goals) {
      state.goals = { ...state.goals, ...goals };
    },
    DELETE_WEIGHT(state, index) {
      state.weightLog.splice(index, 1);
    },
    DELETE_BF(state, index) {
      state.bfLog.splice(index, 1);
    },
  },
  actions: {
    logWeight({ commit }, { date, value }) {
      commit('LOG_WEIGHT', { date: date || new Date().toISOString(), value });
    },
    logBf({ commit }, { date, value }) {
      commit('LOG_BF', { date: date || new Date().toISOString(), value });
    },
    logMeasurement({ commit }, data) {
      commit('LOG_MEASUREMENT', { ...data, date: data.date || new Date().toISOString() });
    },
    setGoals({ commit }, goals) {
      commit('SET_GOALS', goals);
    },
    deleteWeight({ commit }, index) {
      commit('DELETE_WEIGHT', index);
    },
    deleteBf({ commit }, index) {
      commit('DELETE_BF', index);
    },
  },
};
