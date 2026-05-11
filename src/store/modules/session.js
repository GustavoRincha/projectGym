export default {
  namespaced: true,
  state: {
    isActive: false,
    routineId: null,
    routineName: null,
    startTime: null,
    elapsedTime: 0,
    exercises: []
  },
  getters: {
    isActive: (state) => state.isActive,
    routineId: (state) => state.routineId,
    routineName: (state) => state.routineName,
    elapsedTime: (state) => state.elapsedTime,
    exercises: (state) => state.exercises,
  },
  mutations: {
    START_SESSION(state, { routine, exercises }) {
      state.isActive = true;
      state.routineId = routine.id;
      state.routineName = routine.name;
      state.startTime = Date.now();
      state.elapsedTime = 0;
      state.exercises = exercises;
    },
    UPDATE_ELAPSED_TIME(state) {
      if (state.isActive && state.startTime) {
        state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
      }
    },
    UPDATE_EXERCISE(state, { index, exercise }) {
      state.exercises[index] = exercise;
    },
    UPDATE_ALL_EXERCISES(state, exercises) {
      state.exercises = exercises;
    },
    CLEAR_SESSION(state) {
      state.isActive = false;
      state.routineId = null;
      state.routineName = null;
      state.startTime = null;
      state.elapsedTime = 0;
      state.exercises = [];
    }
  },
  actions: {
    startSession({ commit }, routine) {
      // Setup the exercises array with performed arrays
      const exercises = JSON.parse(JSON.stringify(routine.exercises)).map(ex => {
        ex.performed = Array.from({ length: ex.setsMax }, () => ({
          weight: ex.weight || 0,
          reps: ex.repsMax || parseInt(ex.repsMin) || 0,
          completed: false
        }));
        return ex;
      });
      commit('START_SESSION', { routine, exercises });
    },
    updateElapsedTime({ commit }) {
      commit('UPDATE_ELAPSED_TIME');
    },
    updateExercise({ commit }, payload) {
      commit('UPDATE_EXERCISE', payload);
    },
    clearSession({ commit }) {
      commit('CLEAR_SESSION');
    }
  }
};
