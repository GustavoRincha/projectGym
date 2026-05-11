import { supabase } from '@/plugins/supabase';
import { syncService } from '@/services/syncService';

export default {
  namespaced: true,
  state: {
    weightLog:    [], // [{ date: ISO, value: number }]
    bfLog:        [], // [{ date: ISO, value: number }]
    measurements: [], // [{ date, arm, waist, chest, thigh, hip }]
    goals: {
      targetWeight:   null,
      weightGoalType: 'lose', // 'lose' | 'gain'
      targetBf:       null,
      targetArm:      null,
      targetWaist:    null,
      targetChest:    null,
      targetThigh:    null,
      targetHip:      null,
    },
  },
  getters: {
    weightLog:    (s) => s.weightLog,
    bfLog:        (s) => s.bfLog,
    measurements: (s) => s.measurements,
    goals:        (s) => s.goals,
    lastWeight:   (s) => s.weightLog.length ? [...s.weightLog].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null,
    lastBf:       (s) => s.bfLog.length    ? [...s.bfLog].sort((a, b) => new Date(b.date) - new Date(a.date))[0]    : null,
  },
  mutations: {
    LOG_WEIGHT(state, { date, value }) {
      state.weightLog.push({ date, value: parseFloat(value) });
      state.weightLog.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    LOG_BF(state, { date, value }) {
      state.bfLog.push({ date, value: parseFloat(value) });
      state.bfLog.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    LOG_MEASUREMENT(state, entry) {
      state.measurements.push(entry);
      state.measurements.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    SET_GOALS(state, goals) {
      state.goals = { ...state.goals, ...goals };
    },
    DELETE_WEIGHT(state, index) {
      state.weightLog.splice(index, 1);
    },
    DELETE_BF(state, index) {
      state.bfLog.splice(index, 1);
    },
  },
  actions: {
    async fetchBody({ commit, rootState }) {
      const userId = rootState.auth?.user?.id;
      if (!userId) return;

      // 1. Fetch Weight Logs
      const { data: weightData } = await supabase.from('weight_logs').select('*').eq('user_id', userId).order('date', { ascending: true });
      if (weightData) {
        weightData.forEach(d => commit('LOG_WEIGHT', { date: d.date, value: d.value, skipSync: true }));
      }

      // 2. Fetch BF Logs
      const { data: bfData } = await supabase.from('bf_logs').select('*').eq('user_id', userId).order('date', { ascending: true });
      if (bfData) {
        bfData.forEach(d => commit('LOG_BF', { date: d.date, value: d.value, skipSync: true }));
      }

      // 3. Fetch Measurements
      const { data: measData } = await supabase.from('measurements').select('*').eq('user_id', userId).order('date', { ascending: true });
      if (measData) {
        measData.forEach(d => commit('LOG_MEASUREMENT', { ...d, skipSync: true }));
      }

      // 4. Fetch Goals (from user_goals)
      const { data: goalsData } = await supabase.from('user_goals').select('body_goals').eq('user_id', userId).single();
      if (goalsData && goalsData.body_goals) {
        commit('SET_GOALS', { ...goalsData.body_goals, skipSync: true });
      }
    },

    logWeight({ commit, rootState }, { date, value }) {
      const d = date || new Date().toISOString();
      commit('LOG_WEIGHT', { date: d, value });
      syncService.addToQueue('LOG_WEIGHT', { user_id: rootState.auth?.user?.id, date: d, value });
      syncService.processQueue();
    },
    logBf({ commit, rootState }, { date, value }) {
      const d = date || new Date().toISOString();
      commit('LOG_BF', { date: d, value });
      syncService.addToQueue('LOG_BF', { user_id: rootState.auth?.user?.id, date: d, value });
      syncService.processQueue();
    },
    logMeasurement({ commit, rootState }, data) {
      const d = data.date || new Date().toISOString();
      commit('LOG_MEASUREMENT', { ...data, date: d });
      syncService.addToQueue('LOG_MEASUREMENT', { 
        user_id: rootState.auth?.user?.id, 
        date: d, 
        arm: data.arm, waist: data.waist, chest: data.chest, thigh: data.thigh, hip: data.hip 
      });
      syncService.processQueue();
    },
    setGoals({ commit, rootState, state }, goals) {
      commit('SET_GOALS', goals);
      syncService.addToQueue('UPDATE_GOALS', { 
        user_id: rootState.auth?.user?.id, 
        body_goals: state.goals 
      });
      syncService.processQueue();
    },
    deleteWeight({ commit }, index) {
      commit('DELETE_WEIGHT', index);
      // Fila de exclusão pode ser implementada depois se necessário
    },
    deleteBf({ commit }, index) {
      commit('DELETE_BF', index);
      // Fila de exclusão pode ser implementada depois se necessário
    },
  },
};
