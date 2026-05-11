import { supabase } from '@/plugins/supabase';
import { syncService } from '@/services/syncService';

export default {
  namespaced: true,
  state: {
    routines: [], // Start empty, fetch from Supabase
    loading: false,
    error: null
  },
  getters: {
    allRoutines: (state) => state.routines,
    getRoutineById: (state) => (id) => state.routines.find(r => r.id === id),
    isLoading: (state) => state.loading,
  },
  mutations: {
    SET_ROUTINES(state, routines) {
      state.routines = routines;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
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
    async fetchRoutines({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        // Fetch routines
        const { data: routinesData, error: routinesError } = await supabase
          .from('routines')
          .select('*');
        if (routinesError) throw routinesError;

        // Fetch exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*');
        if (exercisesError) throw exercisesError;

        // Combine routines and exercises
        const formattedRoutines = routinesData.map(routine => {
          return {
            ...routine,
            daysOfWeek: routine.days_of_week || [],
            exercises: exercisesData
              .filter(ex => ex.routine_id === routine.id)
              .map(ex => ({
                id: ex.id,
                name: ex.name,
                machine: ex.machine,
                setsMin: ex.sets_min,
                setsMax: ex.sets_max,
                repsMin: ex.reps_min,
                repsMax: ex.reps_max,
                failureSets: ex.failure_sets,
                weight: ex.weight,
                progressionType: ex.progression_type,
                progressionValue: ex.progression_value,
                progressionFrequency: ex.progression_frequency,
                progressionPerSet: ex.progression_per_set
              }))
          };
        });

        commit('SET_ROUTINES', formattedRoutines);
      } catch (error) {
        console.error('Error fetching routines:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async addRoutine({ commit }, routine) {
      // 1. Optimistic UI: Gerar ID localmente e atualizar estado
      const newRoutineId = crypto.randomUUID();
      const routineToSave = {
        ...routine,
        id: newRoutineId,
      };

      // Commitar imediatamente para a tela já mostrar (sem esperar internet)
      commit('ADD_ROUTINE', routineToSave);

      // 2. Formatar payload para a fila de sincronização (camelCase -> snake_case)
      const payload = {
        id: routineToSave.id,
        name: routineToSave.name,
        objective: routineToSave.objective,
        split: routineToSave.split,
        days_of_week: routineToSave.daysOfWeek || [],
        exercises: (routineToSave.exercises || []).map(ex => ({
          id: crypto.randomUUID(),
          routine_id: newRoutineId,
          name: ex.name,
          machine: ex.machine,
          sets_min: ex.setsMin || ex.sets || 3,
          sets_max: ex.setsMax || ex.sets || 4,
          reps_min: ex.repsMin || ex.reps || 8,
          reps_max: ex.repsMax || ex.reps || 15,
          failure_sets: ex.failureSets || 0,
          weight: ex.weight || 0,
          progression_type: ex.progressionType || 'none',
          progression_value: ex.progressionValue || 0,
          progression_frequency: ex.progressionFrequency || 'weekly',
          progression_per_set: ex.progressionPerSet || 0
        }))
      };

      // 3. Adicionar à fila e tentar processar
      syncService.addToQueue('ADD_ROUTINE', payload);
      syncService.processQueue();
    },

    async updateRoutine({ commit }, routine) {
      // 1. Optimistic UI
      commit('UPDATE_ROUTINE', routine);

      // 2. Formatar payload (camelCase -> snake_case)
      const payload = {
        id: routine.id,
        name: routine.name,
        objective: routine.objective,
        split: routine.split,
        days_of_week: routine.daysOfWeek || [],
        exercises: (routine.exercises || []).map(ex => ({
          id: ex.id || crypto.randomUUID(),
          routine_id: routine.id,
          name: ex.name,
          machine: ex.machine,
          sets_min: ex.setsMin || ex.sets || 3,
          sets_max: ex.setsMax || ex.sets || 4,
          reps_min: ex.repsMin || ex.reps || 8,
          reps_max: ex.repsMax || ex.reps || 15,
          failure_sets: ex.failureSets || 0,
          weight: ex.weight || 0,
          progression_type: ex.progressionType || 'none',
          progression_value: ex.progressionValue || 0,
          progression_frequency: ex.progressionFrequency || 'weekly',
          progression_per_set: ex.progressionPerSet || 0
        }))
      };

      // 3. Adicionar à fila e processar
      syncService.addToQueue('UPDATE_ROUTINE', payload);
      syncService.processQueue();
    },

    async deleteRoutine({ commit }, id) {
      // 1. Optimistic UI
      commit('DELETE_ROUTINE', id);

      // 2. Fila
      syncService.addToQueue('DELETE_ROUTINE', { id });
      syncService.processQueue();
    }
  }
};
