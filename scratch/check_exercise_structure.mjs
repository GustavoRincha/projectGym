import axios from 'axios';

const url = 'https://raw.githubusercontent.com/GustavoRincha/projectGym-exercises-dataset/main/data/exercises.json';

async function test() {
  try {
    const res = await axios.get(url);
    const data = res.data;
    console.log('Total exercises:', data.length);
    console.log('Keys of the first exercise:', Object.keys(data[0]));
    console.log('Sample exercise data:', JSON.stringify(data[0], null, 2));
    
    // Find unique values for category, body_part, equipment
    const categories = new Set();
    const bodyParts = new Set();
    const equipments = new Set();
    
    data.forEach(ex => {
      if (ex.category) categories.add(ex.category);
      if (ex.body_part) bodyParts.add(ex.body_part);
      if (ex.equipment) equipments.add(ex.equipment);
    });
    
    console.log('Categories:', Array.from(categories));
    console.log('Body Parts:', Array.from(bodyParts));
    console.log('Equipments:', Array.from(equipments));
  } catch (err) {
    console.error(err);
  }
}

test();
