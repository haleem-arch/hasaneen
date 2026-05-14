import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const { data: fetchRes, error: fetchErr } = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json').then(r => r.json()).then(d => ({data: d})).catch(e => ({error: e}));
  
  if (fetchErr) return console.error(fetchErr);

  // Map to 300+ exercises
  const mapped = fetchRes.slice(0, 400).map(ex => ({
    name: ex.name,
    muscle_group: ex.primaryMuscles[0] || 'Full Body',
    category: ex.category || 'Strength',
    equipment: ex.equipment || 'None',
    difficulty: ex.level || 'Beginner',
    description: Array.isArray(ex.instructions) ? ex.instructions.join(' ') : (ex.instructions || ''),
    image_url: ex.images && ex.images[0] 
      ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[0]}`
      : null,
    source: 'free-exercise-db'
  }));

  console.log(`Clearing and seeding ${mapped.length} exercises...`);
  
  // Try to delete all first
  await supabase.from('exercise_library').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('exercise_library').insert(mapped);
  
  if (error) console.error('Error:', error.message);
  else console.log('Successfully seeded 400 exercises!');
}

seed();
