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

    async register({ commit }, { email, password, name, username }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        // 1. Checar se o username já existe no banco
        const { data: userExists, error: checkError } = await supabase.rpc('check_username_exists', { p_username: username });
        
        if (checkError) {
          console.error("RPC Check Error:", checkError);
          // Se der erro porque a função ainda não foi criada no banco, você pode avisar o usuário ou deixar passar.
          // Por garantia, se der erro de RPC, deixamos passar e o Supabase lida.
        } else if (userExists) {
          throw new Error('Este nome de usuário já está em uso.');
        }

        // 2. Criar a conta
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              username // Salva o username nos metadados
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

    async login({ commit }, { identifier, password }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        let emailToLogin = identifier;

        // Se não tiver @, é porque digitou um nome de usuário. Precisamos descobrir o e-mail.
        if (!identifier.includes('@')) {
          const { data: resolvedEmail, error: rpcError } = await supabase.rpc('get_user_email', { p_username: identifier });
          
          if (rpcError) {
            console.error("RPC Get Email Error:", rpcError);
          }

          if (resolvedEmail) {
            emailToLogin = resolvedEmail;
          } else {
            throw new Error('Usuário não encontrado.');
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToLogin,
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
    },

    async updateProfile({ commit, state }, { name, username }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const currentUsername = state.user?.user_metadata?.username;
        if (username && username !== currentUsername) {
          const { data: userExists, error: checkError } = await supabase.rpc('check_username_exists', { p_username: username });
          if (checkError) {
            console.error("RPC Check Error:", checkError);
          } else if (userExists) {
            throw new Error('Este nome de usuário já está em uso.');
          }
        }

        const { data, error } = await supabase.auth.updateUser({
          data: {
            name,
            username
          }
        });
        if (error) throw error;

        commit('SET_USER', data.user);
        return data.user;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateProfilePicture({ commit }, avatarUrl) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            avatar_url: avatarUrl
          }
        });
        if (error) throw error;

        commit('SET_USER', data.user);
        return data.user;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async loginWithOAuth({ commit }, { provider }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async resetPassword({ commit }, { email }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
