import { supabase } from '@/plugins/supabase';
import { syncService } from '@/services/syncService';

export default {
  namespaced: true,
  state: {
    sessions: [],
    loading: false,
    error: null
  },
  getters: {
    allSessions: (state) => state.sessions,
    lastSession: (state) => state.sessions.length ? state.sessions[state.sessions.length - 1] : null,
    isLoading: (state) => state.loading,
  },
  mutations: {
    SET_SESSIONS(state, sessions) {
      state.sessions = sessions;
    },
    ADD_SESSION(state, session) {
      state.sessions.push(session);
    },
    CLEAR_HISTORY(state) {
      state.sessions = [];
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchHistory({ commit, rootState }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const userId = rootState.auth?.user?.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true }); // Ordenado do mais antigo para o mais novo para refletir a ordem original do state

        if (error) throw error;

        // Converter colunas do Supabase de volta para o formato Vuex
        const formattedSessions = data.map(s => ({
          id: s.id,
          routineId: s.routine_id,
          routineName: s.routine_name,
          date: s.date,
          duration: s.duration,
          exercises: s.exercises || []
        }));

        commit('SET_SESSIONS', formattedSessions);
      } catch (error) {
        console.error('Error fetching history:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    saveSession({ commit, rootState }, sessionData) {
      // Optimistic UI
      const newSessionId = crypto.randomUUID();
      const sessionToSave = { 
        ...sessionData, 
        id: newSessionId 
      };
      commit('ADD_SESSION', sessionToSave);

      // Payload para Supabase
      const payload = {
        id: newSessionId,
        user_id: rootState.auth?.user?.id,
        routine_id: sessionData.routineId,
        routine_name: sessionData.routineName,
        date: sessionData.date || new Date().toISOString(),
        duration: sessionData.duration,
        exercises: sessionData.exercises || []
      };

      syncService.addToQueue('ADD_SESSION', payload);
      syncService.processQueue();
    }
  }
};
