import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedFullLibrary() {
  console.log('Reading local exercises.json...');
  // The file was saved in a temp step path, I'll use that or I'll fetch it again directly in the script
  // Actually, I'll fetch it again to be safe and clean.
  const response = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  const allExercises = await response.json();
  
  console.log(`Found ${allExercises.length} exercises. Mapping...`);

  const mapped = allExercises.map(ex => ({
    name: ex.name,
    muscle_group: ex.primaryMuscles[0] || 'Unknown',
    category: ex.category || 'Strength',
    equipment: ex.equipment || 'None',
    difficulty: ex.level || 'Beginner',
    form_tips: Array.isArray(ex.instructions) ? ex.instructions.join('\n') : '',
    image_url: ex.images && ex.images[0] 
      ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[0]}`
      : null,
    source: 'yuhonas/free-exercise-db'
  }));

  // Deduplicate by name
  const uniqueMapped = [];
  const names = new Set();
  for (const item of mapped) {
    if (!names.has(item.name.toLowerCase())) {
      names.add(item.name.toLowerCase());
      uniqueMapped.push(item);
    }
  }

  console.log(`Inserting ${uniqueMapped.length} unique exercises in chunks...`);

  // Clear existing to avoid duplicates if re-running
  await supabase.from('exercise_library').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const chunkSize = 50;
  for (let i = 0; i < uniqueMapped.length; i += chunkSize) {
    const chunk = uniqueMapped.slice(i, i + chunkSize);
    const { error } = await supabase.from('exercise_library').insert(chunk);
    if (error) {
      console.error(`Error in chunk ${i/chunkSize}:`, error.message);
    } else {
      console.log(`Uploaded chunk ${i/chunkSize + 1}/${Math.ceil(uniqueMapped.length/chunkSize)}`);
    }
  }

  console.log('Seeding complete!');
}

seedFullLibrary();
