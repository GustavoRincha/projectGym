import { describe, it, expect } from 'vitest';
import { parseMachine, formatMachine, getCleanMachineName, groupExercises } from '../src/utils/workoutHelpers.js';

describe('workoutHelpers', () => {
  describe('parseMachine', () => {
    it('should parse machine string with biset ID correctly', () => {
      const result = parseMachine('Polia [biset:123]');
      expect(result).toEqual({ name: 'Polia', bisetId: '123' });
    });

    it('should parse machine string without biset ID correctly', () => {
      const result = parseMachine('Halteres');
      expect(result).toEqual({ name: 'Halteres', bisetId: null });
    });

    it('should handle empty or null machine strings', () => {
      expect(parseMachine('')).toEqual({ name: '', bisetId: null });
      expect(parseMachine(null)).toEqual({ name: '', bisetId: null });
    });
  });

  describe('formatMachine', () => {
    it('should format machine name and biset ID correctly', () => {
      const result = formatMachine('Polia', '123');
      expect(result).toBe('Polia [biset:123]');
    });

    it('should format machine name without biset ID correctly', () => {
      const result = formatMachine('Halteres', null);
      expect(result).toBe('Halteres');
    });

    it('should strip existing biset suffix before formatting new one', () => {
      const result = formatMachine('Polia [biset:999]', '123');
      expect(result).toBe('Polia [biset:123]');
    });
  });

  describe('getCleanMachineName', () => {
    it('should return machine name without biset suffix', () => {
      expect(getCleanMachineName('Polia [biset:123]')).toBe('Polia');
      expect(getCleanMachineName('Halteres')).toBe('Halteres');
    });
  });

  describe('groupExercises', () => {
    it('should return empty list if exercises are null or empty', () => {
      expect(groupExercises(null)).toEqual([]);
      expect(groupExercises([])).toEqual([]);
    });

    it('should group cardio exercises individually', () => {
      const exercises = [
        { id: '1', name: 'Corrida', machine: 'Cardio' }
      ];
      const groups = groupExercises(exercises);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toEqual({
        id: 'cardio-1',
        isBiset: false,
        exercises: [{ id: '1', name: 'Corrida', machine: 'Cardio', cleanMachine: 'Cardio' }]
      });
    });

    it('should group normal exercises individually', () => {
      const exercises = [
        { id: '1', name: 'Rosca Direta', machine: 'Barra' }
      ];
      const groups = groupExercises(exercises);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toEqual({
        id: 'single-1',
        isBiset: false,
        exercises: [{ id: '1', name: 'Rosca Direta', machine: 'Barra', cleanMachine: 'Barra' }]
      });
    });

    it('should group exercises sharing the same biset ID together', () => {
      const exercises = [
        { id: '1', name: 'Supino Reto', machine: 'Barra [biset:g1]' },
        { id: '2', name: 'Crucifixo Inclinado', machine: 'Halteres [biset:g1]' },
        { id: '3', name: 'Rosca Concentrada', machine: 'Halteres' }
      ];
      const groups = groupExercises(exercises);
      expect(groups).toHaveLength(2);
      
      // Bi-Set group
      expect(groups[0].isBiset).toBe(true);
      expect(groups[0].bisetId).toBe('g1');
      expect(groups[0].exercises).toHaveLength(2);
      expect(groups[0].exercises[0].name).toBe('Supino Reto');
      expect(groups[0].exercises[0].cleanMachine).toBe('Barra');
      expect(groups[0].exercises[1].name).toBe('Crucifixo Inclinado');
      expect(groups[0].exercises[1].cleanMachine).toBe('Halteres');

      // Single group
      expect(groups[1].isBiset).toBe(false);
      expect(groups[1].exercises).toHaveLength(1);
      expect(groups[1].exercises[0].name).toBe('Rosca Concentrada');
      expect(groups[1].exercises[0].cleanMachine).toBe('Halteres');
    });
  });
});
