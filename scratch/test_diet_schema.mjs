import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const getEnvVar = (name) => {
  const match = envFile.match(new RegExp(`^\\s*${name}\\s*=\\s*([^\\r\\n#]+)`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const columns = ['free_goals', 'pr_goals', 'volume_goal', 'monthly_target', 'body_goals', 'diet_goals', 'diet_data', 'food_logs'];
  
  for (const col of columns) {
    const { error } = await supabase.from('user_goals').select(col).limit(1);
    if (error) {
      console.log(`Column '${col}' does NOT exist. Error:`, error.message);
    } else {
      console.log(`Column '${col}' EXISTS!`);
    }
  }
}

test();
