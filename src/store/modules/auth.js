import { supabase } from '@/plugins/supabase';

export default {
  namespaced: true,
  state: {
    user: null,
    session: null,
    loading: false,
    error: null,
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_SESSION(state, session) {
      state.session = session;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.session = null;
      state.error = null;
    }
  },
  actions: {
    async initializeAuth({ commit, dispatch }) {
      // Get the initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        commit('SET_SESSION', session);
        commit('SET_USER', session.user);
      } else {
        commit('CLEAR_AUTH');
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          commit('SET_SESSION', session);
          commit('SET_USER', session.user);
        } else {
          commit('CLEAR_AUTH');
        }
      });
    },

    async register({ commit }, { email, password, name }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            }
          }
        });
        if (error) throw error;
        
        // Supabase returns session and user if email confirmation is off
        if (data.session) {
          commit('SET_SESSION', data.session);
          commit('SET_USER', data.user);
        }
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        commit('SET_SESSION', data.session);
        commit('SET_USER', data.user);
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async logout({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        commit('CLEAR_AUTH');
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
