import { parseMachine, formatMachine, groupExercises } from './src/utils/workoutHelpers.js';

console.log('--- Testing parseMachine ---');
console.log('Polia [biset:123] =>', parseMachine('Polia [biset:123]'));
console.log('Halteres =>', parseMachine('Halteres'));

console.log('\n--- Testing formatMachine ---');
console.log('Polia + 123 =>', formatMachine('Polia', '123'));
console.log('Halteres + null =>', formatMachine('Halteres', null));

const mockExercises = [
  { id: '1', name: 'Supino', machine: 'Barra [biset:grp1]' },
  { id: '2', name: 'Puxada', machine: 'Polia [biset:grp1]' },
  { id: '3', name: 'Rosca', machine: 'Halteres' },
  { id: '4', name: 'Cardio 1', machine: 'Cardio' }
];

console.log('\n--- Testing groupExercises ---');
const groups = groupExercises(mockExercises);
console.log(JSON.stringify(groups, null, 2));
