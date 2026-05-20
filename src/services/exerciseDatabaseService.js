import axios from 'axios';

const REPO_OWNER = 'GustavoRincha';
const REPO_NAME = 'projectGym-exercises-dataset';
const BRANCH = 'main';

const JSON_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/data/exercises.json`;
export const MEDIA_BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/`;

// Dicionário estático para músculos e equipamentos
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

// Função para buscar a base de dados
async function getExercises() {
  if (exercisesCache) return exercisesCache;

  // Tenta carregar do localStorage
  const localData = localStorage.getItem('gym_exercises_db');
  if (localData) {
    try {
      exercisesCache = JSON.parse(localData);
      return exercisesCache;
    } catch (e) {
      console.error('Erro ao ler cache de exercícios do localStorage:', e);
    }
  }

  try {
    // Adiciona cache-buster para evitar 404s cacheados do GitHub CDN
    const response = await axios.get(`${JSON_URL}?cb=${Date.now()}`);
    exercisesCache = response.data;
    localStorage.setItem('gym_exercises_db', JSON.stringify(exercisesCache));
    return exercisesCache;
  } catch (error) {
    console.error('Erro ao buscar base de exercícios do GitHub:', error);
    throw new Error('Não foi possível carregar a base de dados de exercícios.');
  }
}

// Helper para tradução via Google Translate (sem CORS)
export async function translateText(text, from = 'en', to = 'pt') {
  if (!text) return '';
  
  const cacheKey = `tr_${from}_${to}_${text.replace(/\s+/g, '_').toLowerCase()}`;
  const cachedTranslation = localStorage.getItem(cacheKey);
  if (cachedTranslation) return cachedTranslation;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    if (response.data && response.data[0]) {
      const translated = response.data[0].map(item => item[0]).join('');
      localStorage.setItem(cacheKey, translated);
      return translated;
    }
  } catch (err) {
    console.warn('Erro na tradução automática:', err);
  }
  return text; // retorna original em caso de falha
}

// Algoritmo de busca fuzzy para achar o melhor exercício correspondente
function findBestMatch(portugueseTerm, englishTerm, exercises) {
  const cleanPt = portugueseTerm.toLowerCase().trim();
  const cleanEn = englishTerm.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const ex of exercises) {
    const exName = ex.name.toLowerCase();
    let score = 0;

    // Se bater exatamente em inglês
    if (exName === cleanEn) {
      score += 100;
    }
    
    // Se bater parcialmente em inglês
    if (exName.includes(cleanEn) || cleanEn.includes(exName)) {
      score += 30;
    }

    // Token matching
    const enTokens = cleanEn.split(/\s+/);
    const exTokens = exName.split(/\s+/);
    
    let tokenMatches = 0;
    for (const t of enTokens) {
      if (t.length > 2 && exName.includes(t)) {
        tokenMatches++;
      }
    }
    score += tokenMatches * 15;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = ex;
    }
  }

  // Retorna se o score for aceitável
  return highestScore >= 15 ? bestMatch : null;
}

// Função principal de busca e tradução dinâmica
export async function getExerciseDetails(exerciseName) {
  if (!exerciseName) return null;

  // 1. Carregar base de dados
  const exercises = await getExercises();

  // 2. Traduzir o termo de busca de PT para EN para bater com a API
  const englishSearchName = await translateText(exerciseName, 'pt', 'en');

  // 3. Achar o exercício correspondente
  const matchedExercise = findBestMatch(exerciseName, englishSearchName, exercises);

  if (!matchedExercise) return null;

  // 4. Traduzir as informações do exercício encontrado para PT
  const translatedName = await translateText(matchedExercise.name, 'en', 'pt');
  
  // Traduzir instruções uma a uma do array instruction_steps
  const translatedInstructions = [];
  const steps = matchedExercise.instruction_steps?.en || matchedExercise.instructions?.en || [];
  const stepsArray = Array.isArray(steps) ? steps : [steps];
  
  for (const inst of stepsArray) {
    const transInst = await translateText(inst, 'en', 'pt');
    translatedInstructions.push(transInst);
  }

  // Mapear músculo e equipamento usando dicionário estático ou tradutor
  const targetMuscleEn = matchedExercise.target || matchedExercise.muscle_group || '';
  const targetMusclePt = TRANSLATIONS[targetMuscleEn.toLowerCase()] || await translateText(targetMuscleEn, 'en', 'pt');

  const equipmentEn = matchedExercise.equipment || '';
  const equipmentPt = TRANSLATIONS[equipmentEn.toLowerCase()] || await translateText(equipmentEn, 'en', 'pt');

  return {
    id: matchedExercise.id,
    name: translatedName,
    originalName: matchedExercise.name,
    gifUrl: matchedExercise.gif_url ? `${MEDIA_BASE_URL}${matchedExercise.gif_url}` : null,
    targetMuscle: targetMusclePt,
    equipment: equipmentPt,
    instructions: translatedInstructions
  };
}
