const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const getEnvVar = (name) => {
  const match = envFile.match(new RegExp(`^\\s*${name}\\s*=\\s*([^\\r\\n#]+)`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const email = `temp_${Date.now()}@gmail.com`;
  const password = 'TemporaryPassword123!';

  console.log('Signing up temporary user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Temp User',
        username: `temp_${Date.now()}`
      }
    }
  });

  if (authError) {
    console.error('Auth Sign Up Error:', authError);
    return;
  }

  const user = authData.user;
  console.log('User signed up successfully. ID:', user.id);

  // Set the session/auth token (supabase client handles this automatically after signUp)
  const routineId = crypto.randomUUID();
  console.log('Inserting routine...');
  const { error: rError } = await supabase.from('routines').insert([{
    id: routineId,
    user_id: user.id,
    name: 'Temporary Routine for Schema Check',
  }]);

  if (rError) {
    console.error('Error inserting routine:', rError);
  } else {
    console.log('Routine inserted successfully. Inserting exercise...');
    const { data: insertedEx, error: exError } = await supabase.from('exercises').insert([{
      routine_id: routineId,
      name: 'Temporary Exercise'
    }]).select();

    if (exError) {
      console.error('Error inserting exercise:', exError);
    } else {
      console.log('Inserted Exercise Row (All columns):', insertedEx);
    }

    // Cleanup exercise and routine
    await supabase.from('exercises').delete().eq('routine_id', routineId);
    await supabase.from('routines').delete().eq('id', routineId);
  }

  // Note: We can't easily delete the user via client API due to admin restrictions, but that's fine.
}

check();
