export default {
  namespaced: true,
  state: {
    routines: [
      {
        id: '1',
        name: 'A - Peito e Tríceps',
        objective: 'Hipertrofia',
        split: 'ABC',
        daysOfWeek: [1, 4],
        exercises: [
          {
            id: '1', name: 'Supino Reto', machine: 'Barra Livre', sets: 4,
            repsMin: 8, repsMax: 12, failureSets: 0,
            weight: 60, progressionType: 'fixed', progressionValue: 2.5, progressionFrequency: 'weekly'
          },
          {
            id: '2', name: 'Tríceps Pulley', machine: 'Polia Alta', sets: 3,
            repsMin: 10, repsMax: 15, failureSets: 1, // Última série até a falha
            weight: 25, progressionType: 'fixed', progressionValue: 1.25, progressionFrequency: 'weekly'
          },
        ]
      },
      {
        id: '2',
        name: 'B - Costas e Bíceps',
        objective: 'Hipertrofia',
        split: 'ABC',
        daysOfWeek: [2, 5],
        exercises: [
          {
            id: '3', name: 'Puxada Frontal', machine: 'Máquina Articulada', sets: 4,
            repsMin: 8, repsMax: 12, failureSets: 0,
            weight: 50, progressionType: 'double', progressionValue: 2.5, progressionFrequency: 'weekly'
          },
          {
            id: '4', name: 'Rosca Direta', machine: 'Halteres', sets: 3,
            repsMin: 10, repsMax: 15, failureSets: 3, // Todas as 3 séries até a falha
            weight: 30, progressionType: 'fixed', progressionValue: 1.25, progressionFrequency: 'biweekly'
          },
        ]
      },
      {
        id: '3',
        name: 'C - Pernas e Ombros',
        objective: 'Hipertrofia',
        split: 'ABC',
        daysOfWeek: [3, 6],
        exercises: [
          {
            id: '5', name: 'Agachamento', machine: 'Barra Livre', sets: 4,
            repsMin: 6, repsMax: 10, failureSets: 0,
            weight: 80, progressionType: 'fixed', progressionValue: 5, progressionFrequency: 'weekly'
          },
          {
            id: '6', name: 'Desenvolvimento', machine: 'Halteres', sets: 3,
            repsMin: 10, repsMax: 15, failureSets: 1, // Última série até a falha
            weight: 40, progressionType: 'percentage', progressionValue: 5, progressionFrequency: 'biweekly'
          },
        ]
      }
    ],
  },
  getters: {
    allRoutines: (state) => state.routines,
    getRoutineById: (state) => (id) => state.routines.find(r => r.id === id),
  },
  mutations: {
    ADD_ROUTINE(state, routine) {
      state.routines.push(routine);
    },
    UPDATE_ROUTINE(state, updatedRoutine) {
      const index = state.routines.findIndex(r => r.id === updatedRoutine.id);
      if (index !== -1) {
        state.routines.splice(index, 1, updatedRoutine);
      }
    },
    DELETE_ROUTINE(state, id) {
      state.routines = state.routines.filter(r => r.id !== id);
    }
  },
  actions: {
    addRoutine({ commit }, routine) {
      commit('ADD_ROUTINE', { ...routine, id: Date.now().toString() });
    },
    updateRoutine({ commit }, routine) {
      commit('UPDATE_ROUTINE', routine);
    },
    deleteRoutine({ commit }, id) {
      commit('DELETE_ROUTINE', id);
    }
  }
};
