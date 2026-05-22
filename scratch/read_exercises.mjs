import axios from 'axios';

async function test() {
  const url = 'https://raw.githubusercontent.com/GustavoRincha/projectGym-exercises-dataset/main/data/exercises.json';
  try {
    const res = await axios.get(url);
    console.log("Total exercises:", res.data.length);
    console.log("First 3 exercises:");
    console.log(JSON.stringify(res.data.slice(0, 3), null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
