import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const gymExercises = [
  // Chest
  { name: 'Barbell Bench Press', muscle_group: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate' },
  { name: 'Incline Dumbbell Press', muscle_group: 'Chest', category: 'Hypertrophy', equipment: 'Dumbbell', difficulty: 'Intermediate' },
  { name: 'Cable Flyes', muscle_group: 'Chest', category: 'Isolation', equipment: 'Cable', difficulty: 'Beginner' },
  { name: 'Push-ups', muscle_group: 'Chest', category: 'Bodyweight', equipment: 'None', difficulty: 'Beginner' },
  // Back
  { name: 'Deadlift', muscle_group: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced' },
  { name: 'Pull-ups', muscle_group: 'Back', category: 'Bodyweight', equipment: 'Barbell', difficulty: 'Intermediate' },
  { name: 'Bent Over Row', muscle_group: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate' },
  { name: 'Lat Pulldown', muscle_group: 'Back', category: 'Hypertrophy', equipment: 'Machine', difficulty: 'Beginner' },
  // Legs
  { name: 'Back Squat', muscle_group: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced' },
  { name: 'Leg Press', muscle_group: 'Legs', category: 'Hypertrophy', equipment: 'Machine', difficulty: 'Beginner' },
  { name: 'Bulgarian Split Squat', muscle_group: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Advanced' },
  { name: 'Leg Extensions', muscle_group: 'Legs', category: 'Isolation', equipment: 'Machine', difficulty: 'Beginner' },
  { name: 'Hamstring Curls', muscle_group: 'Legs', category: 'Isolation', equipment: 'Machine', difficulty: 'Beginner' },
  // Shoulders
  { name: 'Overhead Press', muscle_group: 'Shoulders', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate' },
  { name: 'Lateral Raises', muscle_group: 'Shoulders', category: 'Isolation', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { name: 'Face Pulls', muscle_group: 'Shoulders', category: 'Rehab', equipment: 'Cable', difficulty: 'Beginner' },
  // Arms
  { name: 'Barbell Bicep Curls', muscle_group: 'Arms', category: 'Isolation', equipment: 'Barbell', difficulty: 'Beginner' },
  { name: 'Tricep Pushdowns', muscle_group: 'Arms', category: 'Isolation', equipment: 'Cable', difficulty: 'Beginner' },
  { name: 'Dips', muscle_group: 'Arms', category: 'Bodyweight', equipment: 'Parallel Bars', difficulty: 'Intermediate' },
  // Core
  { name: 'Plank', muscle_group: 'Core', category: 'Stability', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Hanging Leg Raises', muscle_group: 'Core', category: 'Hypertrophy', equipment: 'Pull-up Bar', difficulty: 'Intermediate' }
];

const rehabExercises = [
  { name: 'Band Pull-aparts', muscle_group: 'Shoulders', category: 'Rehab', equipment: 'Resistance Band', difficulty: 'Beginner' },
  { name: 'Clamshells', muscle_group: 'Legs', category: 'Rehab', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Deadbugs', muscle_group: 'Core', category: 'Rehab', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Bird-Dogs', muscle_group: 'Core', category: 'Rehab', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Wall Slides', muscle_group: 'Shoulders', category: 'Rehab', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Tibialis Raises', muscle_group: 'Legs', category: 'Rehab', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Glute Bridges', muscle_group: 'Legs', category: 'Rehab', equipment: 'None', difficulty: 'Beginner' },
  { name: 'Copenhagen Plank', muscle_group: 'Legs', category: 'Rehab', equipment: 'None', difficulty: 'Intermediate' }
];

async function seed() {
  console.log('Seeding Gym Exercises...');
  const { error: gymError } = await supabase.from('exercise_library').insert(gymExercises);
  if (gymError) console.error('Gym Seed Error:', gymError.message);
  else console.log('Gym exercises seeded!');

  console.log('Seeding Rehab Exercises...');
  const { error: rehabError } = await supabase.from('exercise_library').insert(rehabExercises);
  if (rehabError) console.error('Rehab Seed Error:', rehabError.message);
  else console.log('Rehab exercises seeded!');
}

seed();
