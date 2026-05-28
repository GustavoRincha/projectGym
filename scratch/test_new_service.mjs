import { getExerciseSuggestions, getExerciseDetails } from '../src/services/exerciseDatabaseService.js';

// Simulando localStorage para ambiente Node.js
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = val; }
};

async function test() {
  console.log("=== INICIANDO TESTE DO NOVO SERVIÇO ===");
  
  try {
    console.time("getExerciseSuggestions");
    const suggestions = await getExerciseSuggestions();
    console.timeEnd("getExerciseSuggestions");
    
    console.log("Total de sugestões únicas geradas:", suggestions.length);
    console.log("\nAmostra de 10 sugestões:");
    console.log(suggestions.slice(0, 10));

    console.log("\nBuscando detalhes do exercício: 'Abdominal 3/4'");
    console.time("getExerciseDetails ('Abdominal 3/4')");
    const details1 = await getExerciseDetails('Abdominal 3/4');
    console.timeEnd("getExerciseDetails ('Abdominal 3/4')");
    console.log("Detalhes encontrados:", details1);

    console.log("\nBuscando detalhes do exercício com busca aproximada: 'abdominal bicicleta'");
    console.time("getExerciseDetails ('abdominal bicicleta')");
    const details2 = await getExerciseDetails('abdominal bicicleta');
    console.timeEnd("getExerciseDetails ('abdominal bicicleta')");
    console.log("Detalhes encontrados:", details2);

    console.log("\nBuscando detalhes do exercício com busca aproximada (parcial/erro de digitação): 'puxada alta'");
    console.time("getExerciseDetails ('puxada alta')");
    const details3 = await getExerciseDetails('puxada alta');
    console.timeEnd("getExerciseDetails ('puxada alta')");
    console.log("Detalhes encontrados:", details3);

  } catch (error) {
    console.error("Erro no teste:", error);
  }
}

test();
