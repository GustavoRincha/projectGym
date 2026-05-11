export const workoutTemplates = [
  {
    id: 'tpl-1',
    name: 'Programa Iniciante (Full Body)',
    objective: 'Hipertrofia',
    split: 'Corpo Todo',
    level: 'Iniciante',
    days: 3,
    description: 'Treino de corpo inteiro ideal para quem está começando. Realize este mesmo treino 3 vezes por semana (ex: Seg, Qua, Sex).',
    isProgram: true,
    routines: [
      {
        name: 'Full Body Base',
        exercises: [
          { id: 'ex1', name: 'Agachamento (Livre ou Máquina)', setsMin: 3, setsMax: 3, repsMin: 10, repsMax: 15, weight: 0, failureSets: 0 },
          { id: 'ex2', name: 'Supino Reto (Barra ou Máquina)', setsMin: 3, setsMax: 3, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 },
          { id: 'ex3', name: 'Puxada Frontal Alta', setsMin: 3, setsMax: 3, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 },
          { id: 'ex4', name: 'Desenvolvimento Máquina', setsMin: 3, setsMax: 3, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 },
          { id: 'ex5', name: 'Prancha Abdominal', setsMin: 3, setsMax: 3, repsMin: 1, repsMax: 1, weight: 0, failureSets: 0 }
        ]
      }
    ]
  },
  {
    id: 'tpl-2',
    name: 'Programa ABC (Hipertrofia Clássica)',
    objective: 'Hipertrofia',
    split: 'ABC',
    level: 'Intermediário',
    days: 5,
    description: 'O clássico para hipertrofia. Pode ser feito 5 a 6 dias na semana, rodando a sequência A -> B -> C.',
    isProgram: true,
    routines: [
      {
        name: 'Treino A - Peito, Ombro e Tríceps',
        exercises: [
          { id: 'a1', name: 'Supino Reto Barra', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'a2', name: 'Supino Inclinado Halteres', setsMin: 3, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 },
          { id: 'a3', name: 'Crucifixo Máquina', setsMin: 3, setsMax: 3, repsMin: 12, repsMax: 15, weight: 0, failureSets: 1 },
          { id: 'a4', name: 'Elevação Lateral Halteres', setsMin: 4, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 2 },
          { id: 'a5', name: 'Tríceps Pulley (Corda)', setsMin: 3, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 1 },
          { id: 'a6', name: 'Tríceps Testa', setsMin: 3, setsMax: 3, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 }
        ]
      },
      {
        name: 'Treino B - Costas e Bíceps',
        exercises: [
          { id: 'b1', name: 'Puxada Frontal Pegada Aberta', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'b2', name: 'Remada Baixa Triângulo', setsMin: 3, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 },
          { id: 'b3', name: 'Pulldown Corda', setsMin: 3, setsMax: 3, repsMin: 12, repsMax: 15, weight: 0, failureSets: 1 },
          { id: 'b4', name: 'Rosca Direta Barra W', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'b5', name: 'Rosca Martelo Halteres', setsMin: 3, setsMax: 3, repsMin: 12, repsMax: 15, weight: 0, failureSets: 1 }
        ]
      },
      {
        name: 'Treino C - Pernas Completas',
        exercises: [
          { id: 'c1', name: 'Agachamento Livre', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 10, weight: 0, failureSets: 0 },
          { id: 'c2', name: 'Leg Press 45', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'c3', name: 'Cadeira Extensora', setsMin: 3, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 2 },
          { id: 'c4', name: 'Mesa Flexora', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'c5', name: 'Panturrilha Máquina', setsMin: 4, setsMax: 5, repsMin: 15, repsMax: 20, weight: 0, failureSets: 2 }
        ]
      }
    ]
  },
  {
    id: 'tpl-3',
    name: 'Programa Upper / Lower (Força)',
    objective: 'Força',
    split: 'Upper/Lower',
    level: 'Intermediário',
    days: 4,
    description: 'Divisão em 4 dias (Upper, Lower, Descanso, Upper, Lower). Foco em exercícios base com cargas altas e menos repetições.',
    isProgram: true,
    routines: [
      {
        name: 'Treino Upper (Superiores)',
        exercises: [
          { id: 'u1', name: 'Supino Reto Barra pesada', setsMin: 5, setsMax: 5, repsMin: 4, repsMax: 6, weight: 0, failureSets: 0 },
          { id: 'u2', name: 'Remada Curvada', setsMin: 4, setsMax: 5, repsMin: 5, repsMax: 8, weight: 0, failureSets: 0 },
          { id: 'u3', name: 'Desenvolvimento Militar', setsMin: 4, setsMax: 4, repsMin: 6, repsMax: 8, weight: 0, failureSets: 0 },
          { id: 'u4', name: 'Puxada Frontal Supinada', setsMin: 3, setsMax: 4, repsMin: 8, repsMax: 10, weight: 0, failureSets: 0 },
          { id: 'u5', name: 'Rosca Direta + Tríceps Testa', setsMin: 3, setsMax: 3, repsMin: 8, repsMax: 10, weight: 0, failureSets: 0 }
        ]
      },
      {
        name: 'Treino Lower (Inferiores)',
        exercises: [
          { id: 'l1', name: 'Agachamento Livre', setsMin: 5, setsMax: 5, repsMin: 4, repsMax: 6, weight: 0, failureSets: 0 },
          { id: 'l2', name: 'Levantamento Terra Romeno (RDL)', setsMin: 4, setsMax: 4, repsMin: 6, repsMax: 8, weight: 0, failureSets: 0 },
          { id: 'l3', name: 'Leg Press 45', setsMin: 3, setsMax: 4, repsMin: 8, repsMax: 10, weight: 0, failureSets: 0 },
          { id: 'l4', name: 'Panturrilha em pé', setsMin: 4, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 0 }
        ]
      }
    ]
  },
  {
    id: 'tpl-4',
    name: 'Programa Push / Pull / Legs (Avançado)',
    objective: 'Hipertrofia',
    split: 'PPL',
    level: 'Avançado',
    days: 6,
    description: 'Volume alto! Estrutura agressiva de 6 dias, focando em biomecânica (Empurrar, Puxar, Pernas).',
    isProgram: true,
    routines: [
      {
        name: 'Push (Peito, Ombro e Tríceps)',
        exercises: [
          { id: 'p1', name: 'Supino Inclinado Halteres', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'p2', name: 'Desenvolvimento Halteres', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'p3', name: 'Crossover Polia Média', setsMin: 4, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 2 },
          { id: 'p4', name: 'Elevação Lateral Polia', setsMin: 4, setsMax: 5, repsMin: 12, repsMax: 15, weight: 0, failureSets: 2 },
          { id: 'p5', name: 'Tríceps Francês Polia', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 1 }
        ]
      },
      {
        name: 'Pull (Costas, Bíceps e Posterior de Ombro)',
        exercises: [
          { id: 'pu1', name: 'Barra Fixa', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 12, weight: 0, failureSets: 2 },
          { id: 'pu2', name: 'Remada Baixa Triângulo', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'pu3', name: 'Crucifixo Inverso Máquina', setsMin: 4, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 0 },
          { id: 'pu4', name: 'Rosca Scott', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 2 },
          { id: 'pu5', name: 'Rosca Inclinada Halteres', setsMin: 3, setsMax: 3, repsMin: 12, repsMax: 15, weight: 0, failureSets: 1 }
        ]
      },
      {
        name: 'Legs (Pernas Completas)',
        exercises: [
          { id: 'le1', name: 'Agachamento Hack', setsMin: 4, setsMax: 4, repsMin: 8, repsMax: 12, weight: 0, failureSets: 1 },
          { id: 'le2', name: 'Leg Press 45 Pés Altos', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 0 },
          { id: 'le3', name: 'Cadeira Extensora', setsMin: 4, setsMax: 4, repsMin: 12, repsMax: 15, weight: 0, failureSets: 2 },
          { id: 'le4', name: 'Cadeira Flexora', setsMin: 4, setsMax: 4, repsMin: 10, repsMax: 12, weight: 0, failureSets: 2 },
          { id: 'le5', name: 'Panturrilha Máquina e Livre', setsMin: 5, setsMax: 5, repsMin: 15, repsMax: 20, weight: 0, failureSets: 2 }
        ]
      }
    ]
  }
];
