export default {
  namespaced: true,
  state: {
    sessions: [],
  },
  getters: {
    allSessions: (state) => state.sessions,
    lastSession: (state) => state.sessions.length ? state.sessions[state.sessions.length - 1] : null,
  },
  mutations: {
    ADD_SESSION(state, session) {
      state.sessions.push(session);
    },
    CLEAR_HISTORY(state) {
      state.sessions = [];
    }
  },
  actions: {
    saveSession({ commit }, sessionData) {
      // sessionData: { routineId, routineName, date, duration, exercises: [...] }
      commit('ADD_SESSION', { ...sessionData, id: Date.now().toString() });
    }
  }
};
