import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedCoach() {
  const email = 'coach@hasaneen.com';
  const password = 'password123';

  console.log('Creating coach account...');

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Hasaneen Coach' }
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('Auth user created:', userId);

  // 2. Create the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: 'hasaneen_coach',
      email: email,
      display_name: 'Hasaneen Coach',
      role: 'coach'
    });

  if (profileError) {
    console.error('Error creating profile:', profileError.message);
  } else {
    console.log('Coach profile created successfully!');
    console.log('-----------------------------------');
    console.log('Email: coach@hasaneen.com');
    console.log('Password: password123');
    console.log('-----------------------------------');
  }
}

seedCoach();
