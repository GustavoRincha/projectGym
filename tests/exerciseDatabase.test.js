import { describe, it, expect, vi, beforeAll } from 'vitest';
import axios from 'axios';

// Mock do localStorage global para ambiente Node
beforeAll(() => {
  const store = {};
  globalThis.localStorage = {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    clear: vi.fn(() => {
      for (const k in store) delete store[k];
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    })
  };
});

// Mock da biblioteca axios
vi.mock('axios', () => {
  const getMock = vi.fn();
  return {
    default: {
      get: getMock
    },
    get: getMock
  };
});

import { getExercises, getExerciseDetails, getExerciseSuggestions, TRANSLATIONS } from '../src/services/exerciseDatabaseService.js';

const mockExercisesData = [
  {
    id: 'ex1',
    name: 'Supino reto com barra',
    muscle_group: 'chest',
    equipment: 'barbell',
    instruction_steps: {
      pt: ['Deite no banco', 'Empurre a barra']
    }
  },
  {
    id: 'ex2',
    name: 'Rosca concentrada',
    muscle_group: 'biceps',
    equipment: 'dumbbell',
    instruction_steps: {
      pt: ['Sente-se no banco', 'Dobre o cotovelo']
    }
  }
];

describe('exerciseDatabaseService', () => {
  describe('TRANSLATIONS dictionary', () => {
    it('should translate chest to peito', () => {
      expect(TRANSLATIONS['chest']).toBe('peito');
    });

    it('should translate barbell to barra', () => {
      expect(TRANSLATIONS['barbell']).toBe('barra');
    });
  });

  describe('getExercises', () => {
    it('should fetch exercises from GitHub and save to cache', async () => {
      axios.get.mockResolvedValueOnce({ data: mockExercisesData });

      const exercises = await getExercises();
      expect(exercises).toEqual(mockExercisesData);
      expect(axios.get).toHaveBeenCalled();
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith('gym_exercises_db', JSON.stringify(mockExercisesData));
    });
  });

  describe('getExerciseSuggestions', () => {
    it('should return suggestion names sorted alphabetically', async () => {
      axios.get.mockResolvedValueOnce({ data: mockExercisesData });
      
      const suggestions = await getExerciseSuggestions();
      expect(suggestions).toEqual(['Rosca concentrada', 'Supino reto com barra']);
    });
  });

  describe('getExerciseDetails', () => {
    it('should return matched exercise details with Portuguese translations', async () => {
      axios.get.mockResolvedValueOnce({ data: mockExercisesData });

      const details = await getExerciseDetails('Supino reto');
      expect(details).not.toBeNull();
      expect(details.name).toBe('Supino reto com barra');
      expect(details.targetMuscle).toBe('peito'); // 'chest' translated
      expect(details.equipment).toBe('barra'); // 'barbell' translated
      expect(details.instructions).toEqual(['Deite no banco', 'Empurre a barra']);
    });

    it('should return null if no matching exercise is found', async () => {
      axios.get.mockResolvedValueOnce({ data: mockExercisesData });

      const details = await getExerciseDetails('Exercício inexistente');
      expect(details).toBeNull();
    });
  });
});
