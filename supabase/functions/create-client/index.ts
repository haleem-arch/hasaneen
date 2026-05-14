import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the coach is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    // Admin client uses service role (stored as Supabase secret - never exposed to browser)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify the calling user is a coach
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user: coachUser }, error: authError } = await userClient.auth.getUser()
    if (authError || !coachUser) throw new Error('Unauthorized')

    // Verify they are actually a coach
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', coachUser.id)
      .single()

    if (!profile || profile.role !== 'coach') throw new Error('Only coaches can create clients')

    const body = await req.json()
    const { email, password, display_name, username, age, height, experience_level, workouts_per_week, goals, injuries_notes } = body

    // Create the user via admin API (service role - safe server-side)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name,
        role: 'client',
        username
      }
    })
    if (createError) throw createError

    const userId = newUser.user.id

    // Create client profile
    const { error: profileError } = await adminClient.from('client_profiles').insert({
      user_id: userId,
      coach_id: coachUser.id,
      age: parseInt(age) || null,
      height: parseFloat(height) || null,
      experience_level: experience_level || 'beginner',
      workouts_per_week: parseInt(workouts_per_week) || 3,
      goals: goals || '',
      injuries_notes: injuries_notes || '',
      generated_passcode: password
    })
    if (profileError) throw profileError

    // Create workout day slots
    const days = Array.from({ length: parseInt(workouts_per_week) || 3 }, (_, i) => ({
      user_id: userId,
      day_number: i + 1,
      day_name: `Day ${i + 1}`,
      exercises: []
    }))
    await adminClient.from('client_workout_days').insert(days)

    return new Response(
      JSON.stringify({ success: true, userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
