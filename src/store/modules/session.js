export default {
  namespaced: true,
  state: {
    isActive: false,
    routineId: null,
    routineName: null,
    startTime: null,
    elapsedTime: 0,
    exercises: [],
    notes: '',
    cardios: []
  },
  getters: {
    isActive: (state) => state.isActive,
    routineId: (state) => state.routineId,
    routineName: (state) => state.routineName,
    elapsedTime: (state) => state.elapsedTime,
    exercises: (state) => state.exercises,
    notes: (state) => state.notes || '',
    cardios: (state) => state.cardios || [],
  },
  mutations: {
    START_SESSION(state, { routine, exercises }) {
      state.isActive = true;
      state.routineId = routine.id;
      state.routineName = routine.name;
      state.startTime = Date.now();
      state.elapsedTime = 0;
      state.exercises = exercises;
      state.notes = '';
      state.cardios = [];
    },
    UPDATE_ELAPSED_TIME(state) {
      if (state.isActive && state.startTime) {
        state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
      }

      // Increment running cardio timers using timestamp differences to handle background/sleep/throttling
      if (state.cardios && state.cardios.length > 0) {
        const now = Date.now();
        state.cardios = state.cardios.map(cardio => {
          if (cardio.isRunning && cardio.startTime) {
            const secondsSinceStart = Math.floor((now - cardio.startTime) / 1000);
            return {
              ...cardio,
              elapsedTime: (cardio.accumulatedTime || 0) + secondsSinceStart
            };
          }
          return cardio;
        });
      }
    },
    UPDATE_EXERCISE(state, { index, exercise }) {
      state.exercises[index] = exercise;
    },
    UPDATE_ALL_EXERCISES(state, exercises) {
      state.exercises = exercises;
    },
    UPDATE_SESSION_NOTES(state, notes) {
      state.notes = notes;
    },
    UPDATE_ALL_CARDIOS(state, cardios) {
      state.cardios = cardios;
    },
    TOGGLE_CARDIO_TIMER(state, index) {
      if (state.cardios && state.cardios[index]) {
        state.cardios = state.cardios.map((cardio, idx) => {
          if (idx === index) {
            const isStarting = !cardio.isRunning;
            if (isStarting) {
              return {
                ...cardio,
                isRunning: true,
                startTime: Date.now(),
                accumulatedTime: cardio.elapsedTime || 0
              };
            } else {
              const secondsSinceStart = cardio.startTime ? Math.floor((Date.now() - cardio.startTime) / 1000) : 0;
              return {
                ...cardio,
                isRunning: false,
                startTime: null,
                accumulatedTime: 0,
                elapsedTime: (cardio.accumulatedTime || 0) + secondsSinceStart
              };
            }
          }
          return cardio;
        });
      }
    },
    RESET_CARDIO_TIMER(state, index) {
      if (state.cardios && state.cardios[index]) {
        state.cardios = state.cardios.map((cardio, idx) => {
          if (idx === index) {
            return {
              ...cardio,
              elapsedTime: 0,
              accumulatedTime: 0,
              startTime: null,
              isRunning: false
            };
          }
          return cardio;
        });
      }
    },
    UPDATE_CARDIO_MANUAL(state, { index, key, value }) {
      if (state.cardios && state.cardios[index]) {
        state.cardios = state.cardios.map((cardio, idx) => {
          if (idx === index) {
            return {
              ...cardio,
              [key]: value
            };
          }
          return cardio;
        });
      }
    },
    CLEAR_SESSION(state) {
      state.isActive = false;
      state.routineId = null;
      state.routineName = null;
      state.startTime = null;
      state.elapsedTime = 0;
      state.exercises = [];
      state.notes = '';
      state.cardios = [];
    }
  },
  actions: {
    startSession({ commit }, routine) {
      const routineExercises = routine.exercises || [];

      // Musculation exercises
      const exercises = JSON.parse(JSON.stringify(routineExercises.filter(ex => ex.machine !== 'Cardio'))).map(ex => {
        ex.performed = Array.from({ length: ex.setsMax }, () => ({
          weight: ex.weight || 0,
          reps: ex.repsMax || parseInt(ex.repsMin) || 0,
          completed: false
        }));
        return ex;
      });

      // Cardio exercises
      const cardios = JSON.parse(JSON.stringify(routineExercises.filter(ex => ex.machine === 'Cardio'))).map(c => ({
        name: c.name,
        duration: c.setsMax || 20,
        distance: c.repsMax || null,
        elapsedTime: 0,
        accumulatedTime: 0,
        startTime: null,
        isRunning: false
      }));

      commit('START_SESSION', { routine, exercises });
      commit('UPDATE_ALL_CARDIOS', cardios);
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
