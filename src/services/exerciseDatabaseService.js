import axios from 'axios';

const REPO_OWNER = 'GustavoRincha';
const REPO_NAME = 'projectGym-exercises-dataset';
const BRANCH = 'main';

const JSON_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/data/exercises.json`;
export const MEDIA_BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/`;

// Dicionário estático para músculos e equipamentos (caso alguns ainda estejam em inglês no dataset)
export const TRANSLATIONS = {
  // Músculos
  "abductors": "abdutores",
  "abs": "abdômen",
  "adductors": "adutores",
  "biceps": "bíceps",
  "calves": "panturrilhas",
  "cardio": "cardio",
  "chest": "peito",
  "delts": "deltoides",
  "forearms": "antebraços",
  "glutes": "glúteos",
  "hamstrings": "posteriores de coxa",
  "lats": "dorsais",
  "lower back": "lombar",
  "obliques": "oblíquos",
  "pectoralis": "peitorais",
  "quads": "quadríceps",
  "traps": "trapézio",
  "triceps": "tríceps",
  "upper back": "costas superior",
  "hip flexors": "flexores do quadril",
  "ankle stabilizers": "estabilizadores de tornozelo",
  
  // Equipamentos
  "barbell": "barra",
  "dumbbell": "halter",
  "body weight": "peso corporal",
  "cable": "polia",
  "machine": "máquina",
  "kettlebell": "kettlebell",
  "band": "elástico",
  "medicine ball": "bola de medicina",
  "exercise ball": "bola de pilates",
  "ez barbell": "barra EZ",
  "smith machine": "barra guiada (Smith)",
  "assisted": "assistido"
};

// Cache na memória
let exercisesCache = null;

// Função para buscar a base de dados de exercícios
export async function getExercises() {
  const isDev = import.meta.env?.DEV;
  
  // Se não estiver em desenvolvimento e já tivermos o cache na memória, usamos
  if (!isDev && exercisesCache) return exercisesCache;

  const localData = localStorage.getItem('gym_exercises_db');
  const cacheTimestamp = localStorage.getItem('gym_exercises_db_timestamp');
  const cacheDuration = 12 * 60 * 60 * 1000; // 12 horas de expiração do cache

  const isCacheValid = localData && cacheTimestamp && (Date.now() - Number(cacheTimestamp) < cacheDuration);

  // Em desenvolvimento, ignoramos o localStorage/cache para sempre puxar o JSON fresco do repositório
  if (isCacheValid && !isDev) {
    try {
      exercisesCache = JSON.parse(localData);
      return exercisesCache;
    } catch (e) {
      console.error('Erro ao ler cache de exercícios do localStorage:', e);
    }
  }

  try {
    const response = await axios.get(`${JSON_URL}?cb=${Date.now()}`);
    exercisesCache = response.data;
    localStorage.setItem('gym_exercises_db', JSON.stringify(exercisesCache));
    localStorage.setItem('gym_exercises_db_timestamp', Date.now().toString());
    return exercisesCache;
  } catch (error) {
    console.error('Erro ao buscar base de exercícios do GitHub:', error);
    // Se falhar e tivermos dados locais antigos salvos, usamos como fallback
    if (localData) {
      try {
        exercisesCache = JSON.parse(localData);
        return exercisesCache;
      } catch (e) {}
    }
    throw new Error('Não foi possível carregar a base de dados de exercícios.');
  }
}


// Algoritmo de busca fuzzy para achar o melhor exercício correspondente diretamente em português
function findBestMatch(searchTerm, exercises) {
  const cleanTerm = searchTerm.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const ex of exercises) {
    const exName = ex.name.toLowerCase();
    let score = 0;

    // Se bater exatamente
    if (exName === cleanTerm) {
      score += 100;
    }
    
    // Se bater parcialmente
    if (exName.includes(cleanTerm) || cleanTerm.includes(exName)) {
      score += 35;
    }

    // Token matching
    const termTokens = cleanTerm.split(/\s+/).filter(t => t.length > 2);
    const exTokens = exName.split(/\s+/);
    
    let tokenMatches = 0;
    for (const t of termTokens) {
      if (exTokens.includes(t)) {
        tokenMatches += 2; // Palavra completa bate
      } else if (exName.includes(t)) {
        tokenMatches += 1; // Pedaço da palavra bate
      }
    }
    score += tokenMatches * 15;

    // Penalidade por diferença de tamanho (privilegia correspondências mais exatas e específicas)
    if (score > 0) {
      const lengthDiff = Math.abs(exName.length - cleanTerm.length);
      score -= lengthDiff * 0.5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = ex;
    }
  }

  return highestScore >= 15 ? bestMatch : null;
}

// Retorna os detalhes de um exercício específico realizando busca direta em português
export async function getExerciseDetails(exerciseName) {
  if (!exerciseName) return null;

  // 1. Carregar base de dados
  const exercises = await getExercises();

  // 2. Achar o exercício correspondente diretamente
  const matchedExercise = findBestMatch(exerciseName, exercises);

  if (!matchedExercise) return null;

  // 3. Obter as instruções em português (pt ou br) com fallback para inglês (en)
  const steps = matchedExercise.instruction_steps?.pt || 
                matchedExercise.instruction_steps?.br || 
                matchedExercise.instructions?.pt || 
                matchedExercise.instructions?.br || 
                matchedExercise.instruction_steps?.en || 
                matchedExercise.instructions?.en || 
                [];
  
  const stepsArray = Array.isArray(steps) ? steps : (steps ? [steps] : []);

  // Mapear músculo e equipamento usando dicionário estático (caso ainda estejam em inglês no dataset)
  const targetMuscleEn = matchedExercise.muscle_group || matchedExercise.target || '';
  const targetMusclePt = TRANSLATIONS[targetMuscleEn.toLowerCase()] || targetMuscleEn;

  const equipmentEn = matchedExercise.equipment || '';
  const equipmentPt = TRANSLATIONS[equipmentEn.toLowerCase()] || equipmentEn;

  return {
    id: matchedExercise.id,
    name: matchedExercise.name,
    originalName: matchedExercise.name,
    gifUrl: matchedExercise.gif_url ? `${MEDIA_BASE_URL}${matchedExercise.gif_url}` : null,
    targetMuscle: targetMusclePt,
    equipment: equipmentPt,
    instructions: stepsArray
  };
}

// Retorna a lista de nomes de todos os exercícios sugeridos diretamente
export async function getExerciseSuggestions() {
  try {
    const exercises = await getExercises();
    
    const nameSet = new Set();
    for (const ex of exercises) {
      if (ex.name) {
        nameSet.add(ex.name);
      }
    }
    
    // Retorna ordenado alfabeticamente
    return Array.from(nameSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  } catch (err) {
    console.error('Erro ao gerar sugestões de exercícios:', err);
    return [];
  }
}
