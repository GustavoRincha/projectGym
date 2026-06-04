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
      diet: {
        targets: { calories: 2000, protein: 150, carbs: 200, fat: 67 },
        logs: {}
      }
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
    SET_WEIGHT_LOG(state, weightLog) {
      state.weightLog = weightLog;
    },
    SET_BF_LOG(state, bfLog) {
      state.bfLog = bfLog;
    },
    SET_MEASUREMENTS(state, measurements) {
      state.measurements = measurements;
    },
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
      const defaultDiet = {
        targets: { calories: 2000, protein: 150, carbs: 200, fat: 67 },
        logs: {}
      };
      
      const mergedDiet = goals && goals.diet 
        ? { 
            targets: { ...defaultDiet.targets, ...goals.diet.targets }, 
            logs: goals.diet.logs || {} 
          } 
        : (state.goals.diet || defaultDiet);

      state.goals = { 
        ...state.goals, 
        ...goals, 
        diet: mergedDiet 
      };
    },
    SET_DIET_TARGETS(state, targets) {
      if (!state.goals.diet) {
        state.goals.diet = { targets: {}, logs: {} };
      }
      state.goals.diet.targets = { ...state.goals.diet.targets, ...targets };
    },
    SET_DIET_DATA(state, { targets, logs }) {
      if (!state.goals.diet) {
        state.goals.diet = { targets: { calories: 2000, protein: 150, carbs: 200, fat: 67 }, logs: {} };
      }
      if (targets) {
        state.goals.diet.targets = { ...state.goals.diet.targets, ...targets };
      }
      if (logs) {
        state.goals.diet.logs = logs;
      }
    },
    LOG_FOOD(state, { date, meal, food }) {
      if (!state.goals.diet) {
        state.goals.diet = { targets: {}, logs: {} };
      }
      if (!state.goals.diet.logs) {
        state.goals.diet.logs = {};
      }
      if (!state.goals.diet.logs[date]) {
        state.goals.diet.logs[date] = {
          meals: { breakfast: [], lunch: [], dinner: [], snack: [] }
        };
      }
      if (!state.goals.diet.logs[date].meals) {
        state.goals.diet.logs[date].meals = { breakfast: [], lunch: [], dinner: [], snack: [] };
      }
      if (!state.goals.diet.logs[date].meals[meal]) {
        state.goals.diet.logs[date].meals[meal] = [];
      }
      const index = state.goals.diet.logs[date].meals[meal].findIndex(f => f.id === food.id);
      if (index > -1) {
        state.goals.diet.logs[date].meals[meal].splice(index, 1, food);
      } else {
        state.goals.diet.logs[date].meals[meal].push(food);
      }
    },
    DELETE_FOOD(state, { date, meal, foodId }) {
      if (state.goals.diet?.logs?.[date]?.meals?.[meal]) {
        state.goals.diet.logs[date].meals[meal] = state.goals.diet.logs[date].meals[meal].filter(f => f.id !== foodId);
      }
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
        const formatted = weightData.map(d => ({ date: d.date, value: parseFloat(d.value) }));
        commit('SET_WEIGHT_LOG', formatted);
      }

      // 2. Fetch BF Logs
      const { data: bfData } = await supabase.from('bf_logs').select('*').eq('user_id', userId).order('date', { ascending: true });
      if (bfData) {
        const formatted = bfData.map(d => ({ date: d.date, value: parseFloat(d.value) }));
        commit('SET_BF_LOG', formatted);
      }

      // 3. Fetch Measurements
      const { data: measData } = await supabase.from('measurements').select('*').eq('user_id', userId).order('date', { ascending: true });
      if (measData) {
        commit('SET_MEASUREMENTS', measData);
      }

      // 4. Fetch Goals (from user_goals)
      const { data: goalsData } = await supabase.from('user_goals').select('body_goals').eq('user_id', userId).single();
      if (goalsData && goalsData.body_goals) {
        commit('SET_GOALS', { ...goalsData.body_goals, skipSync: true });
      }

      // 5. Fetch Diet Goals (from diet_goals)
      try {
        const { data: dietGoals } = await supabase
          .from('diet_goals')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        const targets = dietGoals ? {
          calories: parseInt(dietGoals.calories) || 2000,
          protein: parseFloat(dietGoals.protein) || 150,
          carbs: parseFloat(dietGoals.carbs) || 200,
          fat: parseFloat(dietGoals.fat) || 67
        } : null;

        // 6. Fetch Diet Logs (from diet_logs)
        const { data: dietLogs } = await supabase
          .from('diet_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        const logs = {};
        if (dietLogs) {
          dietLogs.forEach(item => {
            const dateStr = item.date;
            if (!logs[dateStr]) {
              logs[dateStr] = {
                meals: { breakfast: [], lunch: [], dinner: [], snack: [] }
              };
            }
            if (!logs[dateStr].meals[item.meal]) {
              logs[dateStr].meals[item.meal] = [];
            }
            logs[dateStr].meals[item.meal].push({
              id: item.id,
              name: item.name,
              calories: parseFloat(item.calories) || 0,
              protein: parseFloat(item.protein) || 0,
              carbs: parseFloat(item.carbs) || 0,
              fat: parseFloat(item.fat) || 0,
              portionText: item.portion_text,
              quantity: parseFloat(item.quantity) || 1
            });
          });
        }

        commit('SET_DIET_DATA', { targets, logs });
      } catch (error) {
        console.error('Error fetching diet data:', error);
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
      // Omit diet goals/logs when saving other targets to avoid overwriting or saving heavy payloads
      const nonDietGoals = { ...state.goals };
      delete nonDietGoals.diet;
      syncService.addToQueue('UPDATE_GOALS', { 
        user_id: rootState.auth?.user?.id, 
        body_goals: nonDietGoals 
      });
      syncService.processQueue();
    },
    saveDietTargets({ commit, rootState, state }, targets) {
      commit('SET_DIET_TARGETS', targets);
      syncService.addToQueue('UPDATE_DIET_TARGETS', { 
        user_id: rootState.auth?.user?.id, 
        ...state.goals.diet.targets
      });
      syncService.processQueue();
    },
    logFood({ commit, rootState }, { date, meal, food }) {
      const foodWithId = {
        ...food,
        id: food.id || crypto.randomUUID()
      };
      commit('LOG_FOOD', { date, meal, food: foodWithId });
      syncService.addToQueue('LOG_FOOD_ITEM', {
        id: foodWithId.id,
        user_id: rootState.auth?.user?.id,
        date,
        meal,
        name: foodWithId.name,
        calories: foodWithId.calories,
        protein: foodWithId.protein,
        carbs: foodWithId.carbs,
        fat: foodWithId.fat,
        portion_text: foodWithId.portionText,
        quantity: foodWithId.quantity || 1
      });
      syncService.processQueue();
    },
    deleteFood({ commit }, { date, meal, foodId }) {
      commit('DELETE_FOOD', { date, meal, foodId });
      syncService.addToQueue('DELETE_FOOD_ITEM', { 
        id: foodId 
      });
      syncService.processQueue();
    },
    deleteWeight({ commit }, index) {
      commit('DELETE_WEIGHT', index);
    },
    deleteBf({ commit }, index) {
      commit('DELETE_BF', index);
    },
  },
};
