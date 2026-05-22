import axios from 'axios';

const exercises = [
  { name: "barbell full squat" },
  { name: "barbell squat (on knees)" }
];

function testScore(portugueseTerm, englishTerm) {
  const cleanPt = portugueseTerm.toLowerCase().trim();
  const cleanEn = englishTerm.toLowerCase().trim();

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
      console.log(`  [${ex.name}] partial match +35`);
    }

    // Token matching
    const enTokens = cleanEn.split(/\s+/).filter(t => t.length > 2);
    const exTokens = exName.split(/\s+/);
    
    let tokenMatches = 0;
    for (const t of enTokens) {
      if (exTokens.includes(t)) {
        tokenMatches += 2; // Palavra completa bate
        console.log(`  [${ex.name}] token exact match: "${t}" (+30)`);
      } else if (exName.includes(t)) {
        tokenMatches += 1; // Pedaço da palavra bate
        console.log(`  [${ex.name}] token partial match: "${t}" (+15)`);
      }
    }
    score += tokenMatches * 15;

    // Penalidade por diferença de tamanho
    if (score > 0) {
      const lengthDiff = Math.abs(exName.length - cleanEn.length);
      score -= lengthDiff * 0.5;
      console.log(`  [${ex.name}] length penalty: -${lengthDiff * 0.5} (diff: ${lengthDiff})`);
    }

    console.log(`=> [${ex.name}] final score: ${score}\n`);
  }
}

testScore("Agachamento Livre", "barbell squat");
