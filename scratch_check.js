const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching session:', error);
  } else {
    console.log('Sample session row:', data);
  }
}

check();
