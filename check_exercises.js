import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error, count } = await supabase
    .from('exercise_library')
    .select('*', { count: 'exact' });

  console.log('--- Database Check ---');
  console.log('Count:', count);
  console.log('Error:', error ? error.message : 'None');
  if (data) {
    console.log('Sample Row:', data[0] || 'No rows');
  }
  console.log('----------------------');
}

check();
