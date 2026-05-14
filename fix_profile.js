import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfile() {
  const email = 'coach@hasaneen.com';
  
  console.log('Finding existing auth user...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error('User not found in Auth!');
    return;
  }

  console.log('User found:', user.id);

  console.log('Inserting profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: 'hasaneen_coach',
      email: email,
      display_name: 'Hasaneen Coach',
      role: 'coach'
    });

  if (profileError) {
    console.error('Error creating profile:', profileError.message);
  } else {
    console.log('Coach profile created successfully!');
  }
}

fixProfile();
