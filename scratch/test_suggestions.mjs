import { getExerciseDetails } from '../src/services/exerciseDatabaseService.js';
import axios from 'axios';

// Simulando localStorage para ambiente Node.js
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = val; }
};

// Copiando a lógica de getExerciseSuggestions para testar localmente
import { translateExerciseName } from '../src/services/exerciseDatabaseService.js';

const REPO_OWNER = 'GustavoRincha';
const REPO_NAME = 'projectGym-exercises-dataset';
const BRANCH = 'main';
const JSON_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/data/exercises.json`;

async function getExercises() {
  const response = await axios.get(JSON_URL);
  return response.data;
}

async function test() {
  console.time("Carregamento e Tradução");
  const exercises = await getExercises();
  const nameSet = new Set();
  for (const ex of exercises) {
    const ptName = translateExerciseName(ex.name);
    if (ptName) {
      nameSet.add(ptName);
    }
  }
  const suggestions = Array.from(nameSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  console.timeEnd("Carregamento e Tradução");
  
  console.log("Total de sugestões únicas geradas:", suggestions.length);
  console.log("\nAmostra de 30 sugestões:");
  console.log(suggestions.slice(100, 130));
}

test();
