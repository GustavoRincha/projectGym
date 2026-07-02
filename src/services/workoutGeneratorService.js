import { getExercises } from './exerciseDatabaseService';

// Função para embaralhar um array (Fisher-Yates Shuffle)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Mapeia o equipamento do dataset para os nomes amigáveis do app
const mapEquipment = (equip) => {
  if (!equip) return 'Peso Corporal';
  const e = equip.toLowerCase();
  if (e.includes('barbell') || e.includes('barra')) return 'Barra Livre';
  if (e.includes('dumbbell') || e.includes('halter')) return 'Halteres';
  if (e.includes('cable') || e.includes('polia')) return 'Polia';
  if (e.includes('machine') || e.includes('aparelho') || e.includes('máquina')) return 'Máquina';
  if (e.includes('body weight') || e.includes('peso corporal')) return 'Peso Corporal';
  if (e.includes('band') || e.includes('elástico')) return 'Elástico';
  if (e.includes('kettlebell')) return 'Kettlebell';
  return equip.charAt(0).toUpperCase() + equip.slice(1);
};

export async function generateDynamicWorkout({ level, objective, days }) {
  // 1. Carregar todos os exercícios do banco de dados
  const allExercises = await getExercises();
  if (!allExercises || allExercises.length === 0) {
    throw new Error('Base de exercícios vazia ou não carregada.');
  }

  // 2. Classificar exercícios em categorias musculares para busca rápida
  const chestExs = allExercises.filter(ex => 
    ['peitoral', 'peito', 'chest'].includes(ex.body_part?.toLowerCase()) || 
    ex.target === 'chest'
  );
  
  const backExs = allExercises.filter(ex => 
    ['costas', 'back'].includes(ex.body_part?.toLowerCase()) || 
    ['lats', 'upper back', 'lower back'].includes(ex.target)
  );

  const shoulderExs = allExercises.filter(ex => 
    ['ombros', 'shoulders'].includes(ex.body_part?.toLowerCase()) || 
    ex.target === 'delts'
  );

  const bicepsExs = allExercises.filter(ex => 
    ex.target === 'biceps' || 
    ex.muscle_group?.toLowerCase().includes('bíceps')
  );

  const tricepsExs = allExercises.filter(ex => 
    ex.target === 'triceps' || 
    ex.muscle_group?.toLowerCase().includes('tríceps')
  );

  const legExs = allExercises.filter(ex => 
    ['coxas', 'panturrilhas / pernas', 'pernas', 'lower legs', 'upper legs', 'panturrilhas'].includes(ex.body_part?.toLowerCase())
  );

  const coreExs = allExercises.filter(ex => 
    ['abdome', 'cintura', 'waist'].includes(ex.body_part?.toLowerCase()) || 
    ex.target === 'abs'
  );

  const cardioOptions = [
    { name: 'Esteira (Corrida/Caminhada)', machine: 'Cardio' },
    { name: 'Bicicleta Ergométrica', machine: 'Cardio' },
    { name: 'Elíptico', machine: 'Cardio' },
    { name: 'Escada', machine: 'Cardio' }
  ];

  // 3. Definir parâmetros de séries/repetições com base no objetivo e nível
  let setsMin = 3;
  let setsMax = 4;
  let repsMin = 8;
  let repsMax = 12;
  let failureSets = 0;

  if (objective === 'Força') {
    setsMin = 4;
    setsMax = 5;
    repsMin = 4;
    repsMax = 6;
    failureSets = 0;
  } else if (objective === 'Resistência') {
    setsMin = 3;
    setsMax = 3;
    repsMin = 15;
    repsMax = 20;
    failureSets = 0;
  } else if (objective === 'Emagrecimento') {
    setsMin = 3;
    setsMax = 3;
    repsMin = 12;
    repsMax = 15;
    failureSets = 0;
  } else {
    // Hipertrofia (padrão)
    if (level === 'Intermediário') {
      failureSets = 1;
    } else if (level === 'Avançado') {
      failureSets = 2;
    }
  }

  // Controle de duplicados
  const usedExerciseIds = new Set();

  // Função auxiliar para selecionar um exercício único de um grupo
  const pickUniqueExercise = (group) => {
    const shuffled = shuffleArray(group);
    for (const ex of shuffled) {
      if (!usedExerciseIds.has(ex.id)) {
        usedExerciseIds.add(ex.id);
        const nameCap = ex.name.charAt(0).toUpperCase() + ex.name.slice(1);
        return {
          id: crypto.randomUUID(), // Novo ID único para a rotina
          name: nameCap,
          machine: mapEquipment(ex.equipment),
          setsMin,
          setsMax,
          repsMin,
          repsMax,
          failureSets,
          weight: 0,
          progressionType: 'none',
          progressionValue: 2.5,
          progressionFrequency: 'every_session',
          progressionPerSet: 0
        };
      }
    }
    // Fallback caso acabe os exercícios do grupo
    if (group.length > 0) {
      const fallbackEx = group[Math.floor(Math.random() * group.length)];
      return {
        id: crypto.randomUUID(),
        name: fallbackEx.name,
        machine: mapEquipment(fallbackEx.equipment),
        setsMin,
        setsMax,
        repsMin,
        repsMax,
        failureSets,
        weight: 0,
        progressionType: 'none',
        progressionValue: 2.5,
        progressionFrequency: 'every_session',
        progressionPerSet: 0
      };
    }
    return null;
  };

  const addCardioIfNeeded = (routineList) => {
    if (objective === 'Emagrecimento') {
      const cardioTime = level === 'Iniciante' ? 15 : level === 'Intermediário' ? 20 : 30;
      const randomCardio = cardioOptions[Math.floor(Math.random() * cardioOptions.length)];
      
      routineList.push({
        id: crypto.randomUUID(),
        name: randomCardio.name,
        machine: 'Cardio',
        setsMin: 1,
        setsMax: cardioTime, // Usa setsMax para meta de tempo nos cardios
        repsMin: 0,
        repsMax: 0,
        failureSets: 0,
        weight: 0,
        progressionType: 'none',
        progressionValue: 0,
        progressionFrequency: 'every_session',
        progressionPerSet: 0
      });
    }
  };

  const routines = [];
  let splitName = '';

  // 4. Montar a estrutura de acordo com a quantidade de dias
  if (days === 3) {
    splitName = 'Corpo Todo';
    const dayNames = ['Full Body A', 'Full Body B', 'Full Body C'];
    
    for (let i = 0; i < 3; i++) {
      const exercises = [];
      
      // 1 perna, 1 peito, 1 costas, 1 ombro, 1 braço (bíceps ou tríceps alternados), 1 abdômen
      const leg = pickUniqueExercise(legExs);
      const chest = pickUniqueExercise(chestExs);
      const back = pickUniqueExercise(backExs);
      const shoulder = pickUniqueExercise(shoulderExs);
      const arm = i % 2 === 0 ? pickUniqueExercise(bicepsExs) : pickUniqueExercise(tricepsExs);
      const core = pickUniqueExercise(coreExs);

      if (leg) exercises.push(leg);
      if (chest) exercises.push(chest);
      if (back) exercises.push(back);
      if (shoulder) exercises.push(shoulder);
      if (arm) exercises.push(arm);
      if (core) exercises.push(core);

      addCardioIfNeeded(exercises);

      routines.push({
        name: dayNames[i],
        exercises
      });
    }
  } else if (days === 4) {
    splitName = 'Upper/Lower';
    const dayNames = ['Superior A (Upper)', 'Inferior A (Lower)', 'Superior B (Upper)', 'Inferior B (Lower)'];
    
    for (let i = 0; i < 4; i++) {
      const exercises = [];
      const isUpper = i % 2 === 0;

      if (isUpper) {
        // Superior: 2 peito, 2 costas, 1 ombro, 1 bíceps, 1 tríceps
        const chest1 = pickUniqueExercise(chestExs);
        const back1 = pickUniqueExercise(backExs);
        const chest2 = pickUniqueExercise(chestExs);
        const back2 = pickUniqueExercise(backExs);
        const shoulder = pickUniqueExercise(shoulderExs);
        const biceps = pickUniqueExercise(bicepsExs);
        const triceps = pickUniqueExercise(tricepsExs);

        if (chest1) exercises.push(chest1);
        if (back1) exercises.push(back1);
        if (chest2) exercises.push(chest2);
        if (back2) exercises.push(back2);
        if (shoulder) exercises.push(shoulder);
        if (biceps) exercises.push(biceps);
        if (triceps) exercises.push(triceps);
      } else {
        // Inferior: 3 pernas, 2 abdômen/core
        const leg1 = pickUniqueExercise(legExs);
        const leg2 = pickUniqueExercise(legExs);
        const leg3 = pickUniqueExercise(legExs);
        const core1 = pickUniqueExercise(coreExs);
        const core2 = pickUniqueExercise(coreExs);

        if (leg1) exercises.push(leg1);
        if (leg2) exercises.push(leg2);
        if (leg3) exercises.push(leg3);
        if (core1) exercises.push(core1);
        if (core2) exercises.push(core2);
      }

      addCardioIfNeeded(exercises);

      routines.push({
        name: dayNames[i],
        exercises
      });
    }
  } else {
    // 5 ou 6 dias: Divisão Push/Pull/Legs (PPL)
    splitName = 'PPL';
    const isSixDays = days === 6;
    const routineCount = isSixDays ? 6 : 3;
    
    const pplNames = [
      'Empurrar A (Push)', 'Puxar A (Pull)', 'Pernas A (Legs)',
      'Empurrar B (Push)', 'Puxar B (Pull)', 'Pernas B (Legs)'
    ];

    for (let i = 0; i < routineCount; i++) {
      const exercises = [];
      const type = i % 3; // 0 = Push, 1 = Pull, 2 = Legs

      if (type === 0) {
        // Push: 2 peito, 2 ombro, 1 ou 2 tríceps
        const chest1 = pickUniqueExercise(chestExs);
        const chest2 = pickUniqueExercise(chestExs);
        const shoulder1 = pickUniqueExercise(shoulderExs);
        const shoulder2 = pickUniqueExercise(shoulderExs);
        const triceps1 = pickUniqueExercise(tricepsExs);

        if (chest1) exercises.push(chest1);
        if (chest2) exercises.push(chest2);
        if (shoulder1) exercises.push(shoulder1);
        if (shoulder2) exercises.push(shoulder2);
        if (triceps1) exercises.push(triceps1);

        // Se for avançado/intermediário, adiciona mais um tríceps
        if (level !== 'Iniciante') {
          const triceps2 = pickUniqueExercise(tricepsExs);
          if (triceps2) exercises.push(triceps2);
        }
      } else if (type === 1) {
        // Pull: 2 costas, 2 bíceps, 1 abdômen
        const back1 = pickUniqueExercise(backExs);
        const back2 = pickUniqueExercise(backExs);
        const biceps1 = pickUniqueExercise(bicepsExs);
        const biceps2 = pickUniqueExercise(bicepsExs);
        const core = pickUniqueExercise(coreExs);

        if (back1) exercises.push(back1);
        if (back2) exercises.push(back2);
        if (biceps1) exercises.push(biceps1);
        if (biceps2) exercises.push(biceps2);
        if (core) exercises.push(core);
      } else {
        // Legs: 3 pernas, 1 abdômen
        const leg1 = pickUniqueExercise(legExs);
        const leg2 = pickUniqueExercise(legExs);
        const leg3 = pickUniqueExercise(legExs);
        const core = pickUniqueExercise(coreExs);

        if (leg1) exercises.push(leg1);
        if (leg2) exercises.push(leg2);
        if (leg3) exercises.push(leg3);
        if (core) exercises.push(core);
      }

      addCardioIfNeeded(exercises);

      routines.push({
        name: pplNames[i],
        exercises
      });
    }
  }

  // Retorna um modelo formatado exatamente como os templates estáticos do catálogo
  return {
    id: `dynamic-tpl-${Date.now()}`,
    name: `Treino Personalizado de ${objective} (${splitName})`,
    objective,
    split: splitName,
    level,
    days,
    description: `Programa de treinamento gerado automaticamente baseado nos seus objetivos de ${objective.toLowerCase()} para frequência de ${days} dias semanais.`,
    isProgram: true,
    routines
  };
}
