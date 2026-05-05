// All available badges definition (exported for use in components)
export const ALL_BADGES = [
  { id: 'first_workout', name: 'Primeiro Treino', icon: '🏋️', description: 'Finalize seu primeiro treino', rarity: 'common' },
  { id: 'week_streak', name: 'Em Chamas', icon: '🔥', description: 'Treine 7 dias seguidos', rarity: 'rare' },
  { id: 'month_streak', name: 'Mês Perfeito', icon: '🌟', description: 'Treine 30 dias seguidos', rarity: 'epic' },
  { id: 'early_bird', name: 'Madrugão', icon: '☀️', description: 'Finalize um treino antes das 7h da manhã', rarity: 'common' },
  { id: 'night_owl', name: 'Coruja', icon: '🦉', description: 'Finalize um treino após as 22h', rarity: 'common' },
  { id: '10_workouts', name: '10 Treinos', icon: '🔟', description: 'Finalize 10 treinos', rarity: 'common' },
  { id: '50_workouts', name: '50 Treinos', icon: '🏅', description: 'Finalize 50 treinos', rarity: 'rare' },
  { id: '100_workouts', name: '100 Treinos', icon: '💯', description: 'Finalize 100 treinos', rarity: 'epic' },
  { id: '1_year', name: '1 Ano de Academia', icon: '🎂', description: 'Use o app por 365 dias', rarity: 'legendary' },
  { id: 'volume_10k', name: '10 Toneladas', icon: '🪨', description: 'Levante 10.000kg em uma única sessão', rarity: 'rare' },
];

const LEVELS = [
  { name: 'Iniciante',    minXp: 0,    icon: '🌱', nextXp: 500   },
  { name: 'Intermediário', minXp: 500,  icon: '💪', nextXp: 1500  },
  { name: 'Avançado',     minXp: 1500, icon: '🔥', nextXp: 3500  },
  { name: 'Elite',        minXp: 3500, icon: '⚡', nextXp: 7500  },
  { name: 'Lendário',     minXp: 7500, icon: '🏆', nextXp: null  },
];

export default {
  namespaced: true,
  state: {
    xp: 0,
    unlockedBadges: [], // [{ id, unlockedAt }]
    firstUsedAt: new Date().toISOString(),
  },
  getters: {
    xp: (s) => s.xp,
    unlockedBadges: (s) => s.unlockedBadges,
    level: (s) => {
      let current = LEVELS[0];
      for (const l of LEVELS) {
        if (s.xp >= l.minXp) current = l;
        else break;
      }
      return current;
    },
    levelProgress: (s) => {
      let current = LEVELS[0];
      for (const l of LEVELS) {
        if (s.xp >= l.minXp) current = l;
        else break;
      }
      if (!current.nextXp) return 100; // Max level
      const prevXp = current.minXp;
      const range = current.nextXp - prevXp;
      const earned = s.xp - prevXp;
      return Math.min(100, Math.round((earned / range) * 100));
    },
    xpToNextLevel: (s) => {
      let current = LEVELS[0];
      for (const l of LEVELS) {
        if (s.xp >= l.minXp) current = l;
        else break;
      }
      return current.nextXp ? current.nextXp - s.xp : 0;
    },
    allBadges: (state) => {
      return ALL_BADGES.map(badge => ({
        ...badge,
        unlocked: state.unlockedBadges.some(u => u.id === badge.id),
        unlockedAt: state.unlockedBadges.find(u => u.id === badge.id)?.unlockedAt || null,
      }));
    },
  },
  mutations: {
    ADD_XP(state, amount) {
      state.xp += amount;
    },
    UNLOCK_BADGE(state, badgeId) {
      if (!state.unlockedBadges.some(b => b.id === badgeId)) {
        state.unlockedBadges.push({ id: badgeId, unlockedAt: new Date().toISOString() });
      }
    },
  },
  actions: {
    addXp({ commit }, amount) {
      commit('ADD_XP', amount);
    },
    // Called after every workout session is saved
    checkAndUnlockBadges({ commit, state, rootState }, { sessionData, streak }) {
      const sessions = rootState.history?.sessions || [];
      const hour = new Date(sessionData.date).getHours();

      // Calculate session volume (kg)
      const totalVolume = (sessionData.exercises || []).reduce((total, ex) => {
        return total + (ex.performed || []).reduce((sum, set) => {
          return sum + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0);
        }, 0);
      }, 0);

      const daysSinceFirst = (new Date() - new Date(state.firstUsedAt)) / (1000 * 60 * 60 * 24);

      const conditions = {
        first_workout:  sessions.length >= 1,
        week_streak:    streak >= 7,
        month_streak:   streak >= 30,
        early_bird:     hour < 7,
        night_owl:      hour >= 22,
        '10_workouts':  sessions.length >= 10,
        '50_workouts':  sessions.length >= 50,
        '100_workouts': sessions.length >= 100,
        '1_year':       daysSinceFirst >= 365,
        volume_10k:     totalVolume >= 10000,
      };

      for (const [badgeId, isEarned] of Object.entries(conditions)) {
        if (isEarned && !state.unlockedBadges.some(b => b.id === badgeId)) {
          commit('UNLOCK_BADGE', badgeId);
          commit('ADD_XP', 150); // Badge XP bonus
        }
      }
    },
  },
};
