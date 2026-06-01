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
    async fetchRoutines({ commit, rootState }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const userId = rootState.auth?.user?.id;
        if (!userId) {
          commit('SET_ROUTINES', []);
          return;
        }

        // Fetch routines belonging to this user
        const { data: routinesData, error: routinesError } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', userId);
        if (routinesError) throw routinesError;

        // Fetch exercises belonging to these routines
        let exercisesData = [];
        const routineIds = routinesData.map(r => r.id);
        if (routineIds.length > 0) {
          const { data: exData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .in('routine_id', routineIds);
          if (exercisesError) throw exercisesError;
          exercisesData = exData || [];
        }

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

    async addRoutine({ commit, rootState }, routine) {
      // 1. Optimistic UI: Gerar ID localmente e atualizar estado
      const newRoutineId = crypto.randomUUID();
      const routineToSave = {
        ...routine,
        id: newRoutineId,
        created_by_name: rootState.auth?.user?.user_metadata?.name || 
                         rootState.auth?.user?.user_metadata?.username || 
                         (rootState.auth?.user?.email ? rootState.auth.user.email.split('@')[0] : '') || 
                         'Desconhecido',
      };

      // Commitar imediatamente para a tela já mostrar (sem esperar internet)
      commit('ADD_ROUTINE', routineToSave);

      // 2. Formatar payload para a fila de sincronização (camelCase -> snake_case)
      const payload = {
        id: routineToSave.id,
        user_id: rootState.auth?.user?.id,
        name: routineToSave.name,
        objective: routineToSave.objective,
        split: routineToSave.split,
        days_of_week: routineToSave.daysOfWeek || [],
        created_by_name: routineToSave.created_by_name,
        exercises: (routineToSave.exercises || []).map(ex => ({
          // Não enviamos o 'id' do exercício: deixamos o banco de dados (Supabase) gerar automaticamente
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

    async updateRoutine({ commit, rootState }, routine) {
      const routineToUpdate = {
        ...routine,
        created_by_name: rootState.auth?.user?.user_metadata?.name || 
                         rootState.auth?.user?.user_metadata?.username || 
                         (rootState.auth?.user?.email ? rootState.auth.user.email.split('@')[0] : '') || 
                         'Desconhecido',
      };

      // 1. Optimistic UI
      commit('UPDATE_ROUTINE', routineToUpdate);

      // 2. Formatar payload (camelCase -> snake_case)
      const payload = {
        id: routineToUpdate.id,
        user_id: rootState.auth?.user?.id,
        name: routineToUpdate.name,
        objective: routineToUpdate.objective,
        split: routineToUpdate.split,
        days_of_week: routineToUpdate.daysOfWeek || [],
        created_by_name: routineToUpdate.created_by_name,
        exercises: (routineToUpdate.exercises || []).map(ex => ({
          // Não enviamos o 'id' do exercício: ao atualizar, nós apagamos os antigos e recriamos novos, logo o banco gera novos IDs
          routine_id: routineToUpdate.id,
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
