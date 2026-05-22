import axios from 'axios';

async function test() {
  const url = 'https://raw.githubusercontent.com/GustavoRincha/projectGym-exercises-dataset/main/data/exercises.json';
  try {
    const res = await axios.get(url);
    const search = 'bench press';
    const matches = res.data.filter(ex => ex.name.toLowerCase().includes(search));
    console.log(`Found ${matches.length} exercises containing "${search}":`);
    matches.slice(0, 20).forEach(ex => {
      console.log(`- "${ex.name}" (ID: ${ex.id}, target: ${ex.target}, equipment: ${ex.equipment})`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
