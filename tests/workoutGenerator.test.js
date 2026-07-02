/* global globalThis */
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

import { generateDynamicWorkout } from '../src/services/workoutGeneratorService.js';

// Base de dados mockada com exercícios suficientes para gerar
const mockExercises = [
  // Chest
  { id: '1', name: 'Supino', body_part: 'peito', target: 'chest', equipment: 'barbell' },
  { id: '2', name: 'Crucifixo', body_part: 'peito', target: 'chest', equipment: 'dumbbell' },
  { id: '3', name: 'Supino Inclinado', body_part: 'peito', target: 'chest', equipment: 'dumbbell' },
  { id: '4', name: 'Crossover', body_part: 'peito', target: 'chest', equipment: 'cable' },
  { id: '5', name: 'Crucifixo Inclinado', body_part: 'peito', target: 'chest', equipment: 'dumbbell' },
  // Back
  { id: '6', name: 'Puxada', body_part: 'costas', target: 'lats', equipment: 'cable' },
  { id: '7', name: 'Remada', body_part: 'costas', target: 'lats', equipment: 'barbell' },
  { id: '8', name: 'Remada Unilateral', body_part: 'costas', target: 'lats', equipment: 'dumbbell' },
  { id: '9', name: 'Pulldown', body_part: 'costas', target: 'lats', equipment: 'cable' },
  { id: '10', name: 'Remada Curvada', body_part: 'costas', target: 'lats', equipment: 'barbell' },
  // Shoulders
  { id: '11', name: 'Desenvolvimento', body_part: 'ombros', target: 'delts', equipment: 'dumbbell' },
  { id: '12', name: 'Elevação Lateral', body_part: 'ombros', target: 'delts', equipment: 'dumbbell' },
  { id: '13', name: 'Elevação Frontal', body_part: 'ombros', target: 'delts', equipment: 'dumbbell' },
  // Biceps
  { id: '14', name: 'Rosca Direta', body_part: 'braços', target: 'biceps', equipment: 'barbell' },
  { id: '15', name: 'Rosca Alternada', body_part: 'braços', target: 'biceps', equipment: 'dumbbell' },
  { id: '16', name: 'Rosca Scott', body_part: 'braços', target: 'biceps', equipment: 'barbell' },
  // Triceps
  { id: '17', name: 'Tríceps Testa', body_part: 'braços', target: 'triceps', equipment: 'ez barbell' },
  { id: '18', name: 'Tríceps Corda', body_part: 'braços', target: 'triceps', equipment: 'cable' },
  { id: '19', name: 'Tríceps Francês', body_part: 'braços', target: 'triceps', equipment: 'dumbbell' },
  // Legs
  { id: '20', name: 'Agachamento', body_part: 'pernas', target: 'quads', equipment: 'barbell' },
  { id: '21', name: 'Leg Press', body_part: 'pernas', target: 'quads', equipment: 'machine' },
  { id: '22', name: 'Cadeira Flexora', body_part: 'pernas', target: 'hamstrings', equipment: 'machine' },
  { id: '23', name: 'Cadeira Extensora', body_part: 'pernas', target: 'quads', equipment: 'machine' },
  { id: '24', name: 'Avanço', body_part: 'pernas', target: 'quads', equipment: 'dumbbell' },
  { id: '25', name: 'Panturrilha Máquina', body_part: 'pernas', target: 'calves', equipment: 'machine' },
  // Core
  { id: '26', name: 'Prancha', body_part: 'abdome', target: 'abs', equipment: 'body weight' },
  { id: '27', name: 'Abdominal Supra', body_part: 'abdome', target: 'abs', equipment: 'body weight' },
  { id: '28', name: 'Abdominal Infra', body_part: 'abdome', target: 'abs', equipment: 'body weight' },
  { id: '29', name: 'Abdominal Remador', body_part: 'abdome', target: 'abs', equipment: 'body weight' }
];

describe('workoutGeneratorService', () => {
  it('should generate a 3-day Full Body workout program', async () => {
    axios.get.mockResolvedValueOnce({ data: mockExercises });

    const program = await generateDynamicWorkout({
      level: 'Iniciante',
      objective: 'Hipertrofia',
      days: 3
    });

    expect(program.split).toBe('Corpo Todo');
    expect(program.routines).toHaveLength(3);
    expect(program.routines[0].name).toBe('Full Body A');
    expect(program.routines[1].name).toBe('Full Body B');
    expect(program.routines[2].name).toBe('Full Body C');
    
    // Cada treino de corpo todo deve conter até 6 exercícios (peito, costas, pernas, ombro, braço, abdômen)
    expect(program.routines[0].exercises.length).toBeGreaterThanOrEqual(4);
  });

  it('should generate a 4-day Upper/Lower program', async () => {
    axios.get.mockResolvedValueOnce({ data: mockExercises });

    const program = await generateDynamicWorkout({
      level: 'Intermediário',
      objective: 'Força',
      days: 4
    });

    expect(program.split).toBe('Upper/Lower');
    expect(program.routines).toHaveLength(4);
    expect(program.routines[0].name).toContain('Superior A');
    expect(program.routines[1].name).toContain('Inferior A');

    // Valida parâmetros de repetição para Força
    const firstEx = program.routines[0].exercises[0];
    expect(firstEx.repsMin).toBe(4);
    expect(firstEx.repsMax).toBe(6);
    expect(firstEx.setsMin).toBe(4);
    expect(firstEx.setsMax).toBe(5);
  });

  it('should include cardio exercise when objective is Emagrecimento', async () => {
    axios.get.mockResolvedValueOnce({ data: mockExercises });

    const program = await generateDynamicWorkout({
      level: 'Avançado',
      objective: 'Emagrecimento',
      days: 3
    });

    const routine = program.routines[0];
    const hasCardio = routine.exercises.some(ex => ex.machine === 'Cardio');
    expect(hasCardio).toBe(true);

    const cardioEx = routine.exercises.find(ex => ex.machine === 'Cardio');
    expect(cardioEx.setsMax).toBe(30); // Avançado emagrecimento = 30min cardio
  });

  it('should generate program without duplicates across routines', async () => {
    axios.get.mockResolvedValueOnce({ data: mockExercises });

    const program = await generateDynamicWorkout({
      level: 'Intermediário',
      objective: 'Hipertrofia',
      days: 4
    });

    // Mapear todos os nomes de exercícios físicos (excluindo cardios)
    const exerciseNames = [];
    program.routines.forEach(rt => {
      rt.exercises.forEach(ex => {
        if (ex.machine !== 'Cardio') {
          exerciseNames.push(ex.name);
        }
      });
    });

    // Se as duplicidades forem evitadas, o número de itens únicos deve ser igual ao total
    const uniqueNames = new Set(exerciseNames);
    expect(uniqueNames.size).toBe(exerciseNames.length);
  });
});
