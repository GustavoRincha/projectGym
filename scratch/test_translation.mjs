import axios from 'axios';
import { getExerciseDetails, PORTUGUESE_TO_ENGLISH_MAP, preTranslatePtToEn } from '../src/services/exerciseDatabaseService.js';

// Simulando localStorage para ambiente Node.js
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = val; }
};

async function runTests() {
  const tests = [
    "Rosca Direta",
    "Supino Reto",
    "Supino Reto com Halteres",
    "Agachamento Livre",
    "Rosca Scott",
    "Triceps Pulley"
  ];

  console.log("Iniciando testes de tradução e correspondência...");

  for (const testName of tests) {
    try {
      console.log(`\n-------------------------------------`);
      console.log(`Busca por: "${testName}"`);
      console.log(`Pré-tradução local: "${preTranslatePtToEn(testName)}"`);
      
      const result = await getExerciseDetails(testName);
      if (result) {
        console.log(`✅ Sucesso!`);
        console.log(`👉 Nome Encontrado (Original): ${result.originalName}`);
        console.log(`👉 Nome Traduzido: ${result.name}`);
        console.log(`👉 Músculo Foco: ${result.targetMuscle}`);
        console.log(`👉 Equipamento: ${result.equipment}`);
        console.log(`👉 Instruções (Primeira linha): ${result.instructions[0] || 'Nenhuma'}`);
      } else {
        console.log(`❌ Exercício não encontrado!`);
      }
    } catch (error) {
      console.error(`💥 Erro ao testar "${testName}":`, error.message);
    }
  }
}

runTests();
