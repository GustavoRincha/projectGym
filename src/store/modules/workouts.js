import { supabase } from '@/plugins/supabase';

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

    async addRoutine({ commit, dispatch }, routine) {
      try {
        const { exercises, ...routineData } = routine;
        
        // Insert routine
        const { data: newRoutine, error: routineError } = await supabase
          .from('routines')
          .insert([{
            name: routineData.name,
            objective: routineData.objective,
            split: routineData.split,
            days_of_week: routineData.daysOfWeek
          }])
          .select()
          .single();
          
        if (routineError) throw routineError;

        // Insert exercises
        if (exercises && exercises.length > 0) {
          const exercisesToInsert = exercises.map(ex => ({
            routine_id: newRoutine.id,
            name: ex.name,
            machine: ex.machine,
            sets_min: ex.setsMin,
            sets_max: ex.setsMax,
            reps_min: ex.repsMin,
            reps_max: ex.repsMax,
            failure_sets: ex.failureSets,
            weight: ex.weight,
            progression_type: ex.progressionType,
            progression_value: ex.progressionValue,
            progression_frequency: ex.progressionFrequency,
            progression_per_set: ex.progressionPerSet
          }));

          const { error: exercisesError } = await supabase
            .from('exercises')
            .insert(exercisesToInsert);

          if (exercisesError) throw exercisesError;
        }

        // Refresh routines to get complete data with IDs
        await dispatch('fetchRoutines');
      } catch (error) {
        console.error('Error adding routine:', error);
        throw error;
      }
    },

    async updateRoutine({ commit, dispatch }, routine) {
       try {
         const { exercises, ...routineData } = routine;

         const { error: routineError } = await supabase
           .from('routines')
           .update({
             name: routineData.name,
             objective: routineData.objective,
             split: routineData.split,
             days_of_week: routineData.daysOfWeek
           })
           .eq('id', routine.id);
           
         if (routineError) throw routineError;

         // Delete existing exercises
         const { error: deleteError } = await supabase
           .from('exercises')
           .delete()
           .eq('routine_id', routine.id);

         if (deleteError) throw deleteError;

         // Insert new exercises
         if (exercises && exercises.length > 0) {
           const exercisesToInsert = exercises.map(ex => ({
             routine_id: routine.id,
             name: ex.name,
             machine: ex.machine,
             sets_min: ex.setsMin,
             sets_max: ex.setsMax,
             reps_min: ex.repsMin,
             reps_max: ex.repsMax,
             failure_sets: ex.failureSets,
             weight: ex.weight,
             progression_type: ex.progressionType,
             progression_value: ex.progressionValue,
             progression_frequency: ex.progressionFrequency,
             progression_per_set: ex.progressionPerSet
           }));

           const { error: exercisesError } = await supabase
             .from('exercises')
             .insert(exercisesToInsert);

           if (exercisesError) throw exercisesError;
         }

         await dispatch('fetchRoutines');
       } catch (error) {
         console.error('Error updating routine:', error);
         throw error;
       }
    },

    async deleteRoutine({ commit, dispatch }, id) {
      try {
        const { error } = await supabase
          .from('routines')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        commit('DELETE_ROUTINE', id);
      } catch (error) {
        console.error('Error deleting routine:', error);
        throw error;
      }
    }
  }
};
