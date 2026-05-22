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

// Dicionário de tradução direta de termos comuns de treino PT -> EN
export const PORTUGUESE_TO_ENGLISH_MAP = {
  // Supino / Chest
  "supino": "barbell bench press",
  "supino reto": "barbell bench press",
  "supino inclinado": "barbell incline bench press",
  "supino declinado": "barbell decline bench press",
  "supino reto com halteres": "dumbbell bench press",
  "supino inclinado com halteres": "dumbbell incline bench press",
  "supino declinado com halteres": "dumbbell decline bench press",
  "supino com halteres": "dumbbell bench press",
  "supino reto com barra": "barbell bench press",
  "supino inclinado com barra": "barbell incline bench press",
  "supino declinado com barra": "barbell decline bench press",
  "crucifixo": "dumbbell fly",
  "crucifixo reto": "flat dumbbell fly",
  "crucifixo inclinado": "incline dumbbell fly",
  "pec deck": "butterfly",
  "voador": "butterfly",
  "voador peito": "butterfly",
  "cross over": "cable crossover",
  "crossover": "cable crossover",

  // Costas / Back
  "puxada frente": "cable lat pulldown",
  "puxada alta": "cable lat pulldown",
  "puxada pulley": "cable lat pulldown",
  "puxada atras": "behind neck pulldown",
  "remada": "barbell row",
  "remada curvada": "barbell row",
  "remada unilateral": "dumbbell row",
  "remada serrote": "dumbbell row",
  "remada baixa": "cable row",
  "remada cavalo": "t-bar row",
  "remada cavalinho": "t-bar row",
  "barra fixa": "pullup",
  "barra": "pullup",
  "pull up": "pullup",
  "chin up": "chin-up",
  "pullover": "pullover",
  "pull over": "pullover",

  // Ombros / Shoulders
  "desenvolvimento": "dumbbell shoulder press",
  "desenvolvimento com halteres": "dumbbell shoulder press",
  "desenvolvimento militar": "barbell military press",
  "desenvolvimento smith": "smith machine shoulder press",
  "elevação lateral": "dumbbell lateral raise",
  "elevação frontal": "dumbbell front raise",
  "crucifixo inverso": "rear delt fly",
  "encolhimento": "shrug",

  // Bíceps / Biceps
  "rosca direta": "barbell curl",
  "rosca direta com barra": "barbell curl",
  "rosca direta barra w": "ez barbell curl",
  "rosca direta barra": "barbell curl",
  "rosca alternada": "dumbbell biceps curl",
  "rosca concentrada": "concentration curl",
  "rosca martelo": "dumbbell hammer curl",
  "rosca scott": "barbell preacher curl",
  "rosca scott com barra": "barbell preacher curl",
  "rosca scott com halteres": "dumbbell preacher curl",
  "rosca scott na polia": "cable preacher curl",
  "rosca inversa": "barbell reverse curl",

  // Tríceps / Triceps
  "triceps testa": "barbell triceps extension",
  "triceps testa com barra": "ez barbell triceps extension",
  "triceps testa com halteres": "dumbbell triceps extension",
  "triceps pulley": "cable triceps pushdown (v-bar)",
  "triceps corda": "cable triceps pushdown (rope)",
  "triceps coice": "dumbbell kickback",
  "triceps frances": "dumbbell overhead triceps extension",
  "mergulho no banco": "bench dip",
  "paralelas": "dips",

  // Pernas / Legs
  "agachamento": "barbell full squat",
  "agachamento livre": "barbell full squat",
  "agachamento smith": "smith machine squat",
  "agachamento búlgaro": "dumbbell bulgarian split squat",
  "agachamento bulgaro": "dumbbell bulgarian split squat",
  "agachamento sumô": "dumbbell sumo squat",
  "agachamento sumo": "dumbbell sumo squat",
  "leg press": "leg press",
  "leg press 45": "leg press",
  "cadeira extensora": "leg extension",
  "extensora": "leg extension",
  "mesa flexora": "leg curl",
  "flexora": "leg curl",
  "cadeira flexora": "seated leg curl",
  "stiff": "barbell stiff-legged deadlift",
  "levantamento terra": "barbell deadlift",
  "afundo": "dumbbell lunge",
  "passada": "dumbbell walking lunge",
  "elevação pelvica": "barbell hip thrust",
  "elevação pélvica": "barbell hip thrust",
  "adutora": "cable adductor",
  "abdutora": "cable abductor",

  // Panturrilha / Calves
  "panturrilha": "standing calf raise",
  "panturrilha em pe": "standing calf raise",
  "panturrilha em pé": "standing calf raise",
  "panturrilha sentado": "seated calf raise",
  "panturrilha leg press": "calf press on leg press",

  // Abdômen / Abs
  "abdominal": "crunch",
  "abdominal supra": "crunch",
  "abdominal infra": "hanging leg raise",
  "prancha": "plank",
  "abdominal deitado": "crunch"
};

// Sanitiza e pré-traduz termos em português para evitar erros de tradutores automáticos
export function preTranslatePtToEn(text) {
  let val = text.toLowerCase().trim();
  
  if (PORTUGUESE_TO_ENGLISH_MAP[val]) {
    return PORTUGUESE_TO_ENGLISH_MAP[val];
  }

  val = val
    .replace(/\bcom halteres\b/g, 'dumbbell')
    .replace(/\bcom halter\b/g, 'dumbbell')
    .replace(/\bcom barra\b/g, 'barbell')
    .replace(/\bna polia\b/g, 'cable')
    .replace(/\bno cabo\b/g, 'cable')
    .replace(/\bsupino reto\b/g, 'flat bench press')
    .replace(/\bsupino inclinado\b/g, 'incline bench press')
    .replace(/\bsupino declinado\b/g, 'decline bench press')
    .replace(/\bsupino\b/g, 'bench press')
    .replace(/\brosca direta\b/g, 'barbell curl')
    .replace(/\brosca scott\b/g, 'preacher curl')
    .replace(/\brosca martelo\b/g, 'hammer curl')
    .replace(/\brosca concentrada\b/g, 'concentration curl')
    .replace(/\brosca\b/g, 'curl')
    .replace(/\bagachamento\b/g, 'squat')
    .replace(/\bremada\b/g, 'row')
    .replace(/\belevação lateral\b/g, 'lateral raise')
    .replace(/\belevação frontal\b/g, 'front raise')
    .replace(/\belevação\b/g, 'raise')
    .replace(/\bdesenvolvimento\b/g, 'shoulder press')
    .replace(/\bcrucifixo\b/g, 'fly')
    .replace(/\bpanturrilha\b/g, 'calf raise')
    .replace(/\bextensora\b/g, 'leg extension')
    .replace(/\bflexora\b/g, 'leg curl')
    .replace(/\btriceps\b/g, 'triceps')
    .replace(/\btríceps\b/g, 'triceps')
    .replace(/\bbiceps\b/g, 'biceps')
    .replace(/\bbíceps\b/g, 'biceps');

  return val;
}

// Cache na memória
let exercisesCache = null;

// Função para buscar a base de dados
export async function getExercises() {
  if (exercisesCache) return exercisesCache;

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
  return text;
}

// Algoritmo de busca fuzzy aprimorado para achar o melhor exercício correspondente
function findBestMatch(portugueseTerm, englishTerm, exercises) {
  const cleanPt = portugueseTerm.toLowerCase().trim();
  const cleanEn = englishTerm.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const ex of exercises) {
    const exName = ex.name.toLowerCase();
    let score = 0;

    // Se bater exatamente
    if (exName === cleanEn) {
      score += 100;
    }
    
    // Se bater parcialmente
    if (exName.includes(cleanEn) || cleanEn.includes(exName)) {
      score += 35;
    }

    // Token matching
    const enTokens = cleanEn.split(/\s+/).filter(t => t.length > 2);
    const exTokens = exName.split(/\s+/);
    
    let tokenMatches = 0;
    for (const t of enTokens) {
      if (exTokens.includes(t)) {
        tokenMatches += 2; // Palavra completa bate
      } else if (exName.includes(t)) {
        tokenMatches += 1; // Pedaço da palavra bate
      }
    }
    score += tokenMatches * 15;

    // Penalidade por diferença de tamanho (privilegia correspondências mais exatas e específicas)
    if (score > 0) {
      const lengthDiff = Math.abs(exName.length - cleanEn.length);
      score -= lengthDiff * 0.5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = ex;
    }
  }

  return highestScore >= 15 ? bestMatch : null;
}

// Dicionário de pós-tradução de termos em inglês para português natural de academia
export const ENGLISH_TO_PORTUGUESE_CLEANUP = {
  "preacher curl": "rosca scott",
  "biceps curl": "rosca bíceps",
  "bicep curl": "rosca bíceps",
  "barbell curl": "rosca direta",
  "hammer curl": "rosca martelo",
  "concentration curl": "rosca concentrada",
  "reverse curl": "rosca inversa",
  "bench press": "supino",
  "flat bench press": "supino reto",
  "incline bench press": "supino inclinado",
  "decline bench press": "supino declinado",
  "shoulder press": "desenvolvimento",
  "overhead press": "desenvolvimento",
  "military press": "desenvolvimento militar",
  "lateral raise": "elevação lateral",
  "front raise": "elevação frontal",
  "rear delt fly": "crucifixo inverso",
  "dumbbell fly": "crucifixo",
  "cable crossover": "crossover",
  "lat pulldown": "puxada frente",
  "pulldown": "puxada",
  "barbell row": "remada curvada",
  "dumbbell row": "remada unilateral",
  "cable row": "remada baixa",
  "t-bar row": "remada cavalinho",
  "pullup": "barra fixa",
  "pull-up": "barra fixa",
  "chin-up": "barra fixa supinada",
  "triceps extension": "tríceps testa",
  "triceps pushdown": "tríceps pulley",
  "triceps pushdown (v-bar)": "tríceps pulley (barra V)",
  "triceps pushdown (rope)": "tríceps corda",
  "kickback": "tríceps coice",
  "bench dip": "tríceps banco",
  "dip": "paralelas",
  "full squat": "agachamento livre",
  "squat": "agachamento",
  "leg press": "leg press",
  "leg extension": "cadeira extensora",
  "leg curl": "mesa flexora",
  "seated leg curl": "cadeira flexora",
  "deadlift": "levantamento terra",
  "stiff-legged deadlift": "stiff",
  "lunge": "afundo",
  "walking lunge": "passada",
  "hip thrust": "elevação pélvica",
  "shrug": "encolhimento",
  "calf raise": "panturrilha",
  "standing calf raise": "panturrilha em pé",
  "seated calf raise": "panturrilha sentado",
  "crunch": "abdominal",
  "plank": "prancha"
};

// Converte nomes de exercícios em inglês para português natural de musculação de forma precisa e sem requisições adicionais
export function translateExerciseName(englishName) {
  let name = englishName.toLowerCase();

  // 1. Substituições de movimentos/exercícios compostos primeiro
  for (const [eng, pt] of Object.entries(ENGLISH_TO_PORTUGUESE_CLEANUP)) {
    if (name.includes(eng)) {
      name = name.replace(new RegExp(`\\b${eng}\\b`, 'g'), pt);
    }
  }

  // 2. Extrai e mapeia equipamentos
  let equipment = '';
  if (name.includes('barbell')) {
    equipment = 'com barra';
    name = name.replace(/\bbarbell\b/g, '');
  } else if (name.includes('dumbbell')) {
    equipment = 'com halteres';
    name = name.replace(/\bdumbbell\b/g, '');
  } else if (name.includes('cable')) {
    equipment = 'na polia';
    name = name.replace(/\bcable\b/g, '');
  } else if (name.includes('smith machine') || name.includes('smith')) {
    equipment = 'no smith';
    name = name.replace(/\bsmith machine\b|\bsmith\b/g, '');
  } else if (name.includes('band')) {
    equipment = 'com elástico';
    name = name.replace(/\bband\b/g, '');
  } else if (name.includes('body weight') || name.includes('bodyweight')) {
    equipment = 'peso corporal';
    name = name.replace(/\bbody weight\b|\bbodyweight\b/g, '');
  }

  name = name.replace(/\s+/g, ' ').trim();
  if (equipment) {
    const lowerName = name.toLowerCase();
    const hasEquipmentInName = 
      lowerName.includes('barra') || 
      lowerName.includes('halter') || 
      lowerName.includes('polia') || 
      lowerName.includes('cabo') || 
      lowerName.includes('elástico') || 
      lowerName.includes('elastico') || 
      lowerName.includes('corporal') || 
      lowerName.includes('smith');

    if (!hasEquipmentInName) {
      name = `${name} ${equipment}`;
    }
  }

  // Limpezas extras de termos soltos
  name = name
    .replace(/\blying\b/g, 'deitado')
    .replace(/\bseated\b/g, 'sentado')
    .replace(/\bstanding\b/g, 'em pé')
    .replace(/\bone arm\b/g, 'unilateral')
    .replace(/\bsingle arm\b/g, 'unilateral')
    .replace(/\balternate\b/g, 'alternado')
    .replace(/\bclose grip\b/g, 'pegada fechada')
    .replace(/\bwide grip\b/g, 'pegada aberta')
    .replace(/\breverse grip\b/g, 'pegada invertida')
    .replace(/\breverse\b/g, 'inverso')
    .replace(/\bdecline\b/g, 'declinado')
    .replace(/\bincline\b/g, 'inclinado')
    .replace(/\bflat\b/g, 'reto')
    .replace(/\bse-bar\b/g, 'barra EZ')
    .replace(/\bez-bar\b/g, 'barra EZ')
    .replace(/\bez\b/g, 'barra EZ')
    .replace(/\s+/g, ' ')
    .trim();

  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Função principal de busca e tradução dinâmica otimizada
export async function getExerciseDetails(exerciseName) {
  if (!exerciseName) return null;

  // 1. Carregar base de dados
  const exercises = await getExercises();

  // 2. Pré-traduzir usando o dicionário local e depois usar a API apenas se necessário
  let englishSearchName = preTranslatePtToEn(exerciseName);
  
  // Se após a pré-tradução ainda parecer português ou se não houve hit exato no mapa, faz tradução na API
  const needsApiTranslate = !PORTUGUESE_TO_ENGLISH_MAP[exerciseName.toLowerCase().trim()];
  if (needsApiTranslate) {
    englishSearchName = await translateText(englishSearchName, 'pt', 'en');
  }

  // 3. Achar o exercício correspondente
  const matchedExercise = findBestMatch(exerciseName, englishSearchName, exercises);

  if (!matchedExercise) return null;

  // 4. Traduzir o nome do exercício localmente (sem requisição HTTP) usando nossa lógica precisa
  const translatedName = translateExerciseName(matchedExercise.name);

  // 5. Traduzir as instruções de forma agrupada (apenas as instruções, reduzindo chamadas a 1 única requisição)
  const steps = matchedExercise.instruction_steps?.en || matchedExercise.instructions?.en || [];
  const stepsArray = Array.isArray(steps) ? steps : [steps];
  
  const translatedInstructions = [];
  if (stepsArray.length > 0) {
    const joinedText = stepsArray.join('\n--- ');
    const translatedJoined = await translateText(joinedText, 'en', 'pt');
    
    // Divide de volta respeitando o delimitador
    const translatedLines = translatedJoined.split(/\n?---\s?/).map(line => line.trim());
    
    // Se o split falhou e retornou vazio, tenta recuperar
    if (translatedLines.length > 0 && translatedLines[0]) {
      translatedInstructions.push(...translatedLines);
    } else {
      // Fallback
      for (const inst of stepsArray) {
        const fallbackInst = await translateText(inst, 'en', 'pt');
        translatedInstructions.push(fallbackInst);
      }
    }
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

// Retorna a lista de nomes de todos os exercícios sugeridos já traduzidos para o português (sem chamadas de API)
export async function getExerciseSuggestions() {
  try {
    const exercises = await getExercises();
    
    // Mapear, traduzir e remover duplicadas
    const nameSet = new Set();
    for (const ex of exercises) {
      const ptName = translateExerciseName(ex.name);
      if (ptName) {
        nameSet.add(ptName);
      }
    }
    
    // Retorna ordenado alfabeticamente
    return Array.from(nameSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  } catch (err) {
    console.error('Erro ao gerar sugestões de exercícios:', err);
    return [];
  }
}
