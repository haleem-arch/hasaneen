-- ============================================================
-- AUTHENTICATION & USERS
-- ============================================================

-- Extended profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coach', 'client')),
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach settings
CREATE TABLE coach_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  gym_name VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client details
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  age INTEGER,
  height DECIMAL(5,2),
  starting_weight DECIMAL(6,2),
  starting_bf DECIMAL(4,1),
  goals TEXT,
  injuries_notes TEXT,
  preferred_equipment TEXT,
  availability_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- EXERCISES & LIBRARY
-- ============================================================

CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  muscle_group VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  equipment VARCHAR(100),
  difficulty VARCHAR(50),
  description TEXT,
  form_tips TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  source VARCHAR(100) DEFAULT 'exrx',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercise_muscle ON exercise_library(muscle_group);
CREATE INDEX idx_exercise_category ON exercise_library(category);

-- ============================================================
-- TRAINING PLANS
-- ============================================================

CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 4,
  focus VARCHAR(255),
  difficulty VARCHAR(50),
  is_template BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  day_number INTEGER CHECK (day_number BETWEEN 1 AND 7),
  day_name VARCHAR(50),
  day_type VARCHAR(50),
  focus_area VARCHAR(255),
  rest_day BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id UUID NOT NULL REFERENCES training_plan_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  sets INTEGER DEFAULT 3,
  reps_min INTEGER DEFAULT 8,
  reps_max INTEGER DEFAULT 12,
  rest_seconds INTEGER DEFAULT 90,
  notes TEXT,
  tier VARCHAR(10),
  exercise_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CLIENT PLAN ASSIGNMENTS
-- ============================================================

CREATE TABLE client_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT NOW(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- WORKOUTS & SESSIONS
-- ============================================================

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_day_id UUID REFERENCES training_plan_days(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  day_type VARCHAR(50),
  duration_minutes INTEGER,
  total_volume DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'discarded')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  sets JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  exercise_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sets are stored as JSONB:
-- sets: [
--   { setNum: 1, weight: 50, reps: 10, rpe: 8, done: true },
--   { setNum: 2, weight: 50, reps: 10, rpe: 8, done: false }
-- ]

-- ============================================================
-- DIET & NUTRITION
-- ============================================================

CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  calories INTEGER,
  protein DECIMAL(5,1),
  carbs DECIMAL(5,1),
  fat DECIMAL(5,1),
  is_template BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_diet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  daily_totals JSONB DEFAULT '{"kcal": 0, "protein": 0, "carbs": 0, "fat": 0}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diet_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_log_id UUID NOT NULL REFERENCES diet_logs(id) ON DELETE CASCADE,
  meal_name VARCHAR(255),
  meal_time TIME,
  items JSONB DEFAULT '[]',
  total_macros JSONB DEFAULT '{"kcal": 0, "protein": 0, "carbs": 0, "fat": 0}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE food_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  kcal_per_100g DECIMAL(6,2),
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  fiber DECIMAL(5,2),
  source VARCHAR(100) DEFAULT 'preset',
  barcode VARCHAR(20),
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- BODY COMPOSITION TRACKING (InBody)
-- ============================================================

CREATE TABLE inbody_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(6,2),
  smm DECIMAL(6,2),
  bfm DECIMAL(6,2),
  bf_percent DECIMAL(4,1),
  bmr DECIMAL(6,2),
  inbody_score DECIMAL(5,2),
  visceral_fat DECIMAL(5,2),
  total_water DECIMAL(6,2),
  protein DECIMAL(6,2),
  mineral DECIMAL(6,2),
  segmental JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- REHAB & INJURY MANAGEMENT
-- ============================================================

CREATE TABLE rehab_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  injury_type VARCHAR(100),
  body_part VARCHAR(100),
  severity VARCHAR(50),
  description TEXT,
  form_tips TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  duration_seconds INTEGER,
  difficulty VARCHAR(50),
  source VARCHAR(100) DEFAULT 'open_source',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rehab_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  duration_weeks INTEGER DEFAULT 4,
  injury_focus VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rehab_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES rehab_programs(id) ON DELETE CASCADE,
  day_number INTEGER,
  day_name VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rehab_program_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id UUID NOT NULL REFERENCES rehab_program_days(id) ON DELETE CASCADE,
  rehab_exercise_id UUID NOT NULL REFERENCES rehab_library(id) ON DELETE CASCADE,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 12,
  exercise_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_rehab (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES rehab_programs(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  injury_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rehab_session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES rehab_programs(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  exercises_completed INTEGER,
  pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- AI COACHING & CHAT
-- ============================================================

CREATE TABLE ai_chat (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_user_session ON ai_chat(user_id, session_id);

-- ============================================================
-- PROGRESS TRACKING
-- ============================================================

CREATE TABLE progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT NOT NULL,
  category VARCHAR(100),
  visibility VARCHAR(50) DEFAULT 'coach_only',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Clients can only see their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Coaches can view their client profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'coach' AND id = (SELECT coach_id FROM client_profiles WHERE user_id = auth.uid()))
  );

-- Workouts: Clients see own, coaches see their clients'
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view client workouts" ON workouts
  FOR SELECT USING (
    auth.uid() = coach_id OR
    auth.uid() IN (SELECT coach_id FROM client_profiles WHERE user_id = user_id)
  );

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Diet logs: Clients see own, coaches see clients'
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own diet logs" ON diet_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view client diet logs" ON diet_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT coach_id FROM client_profiles WHERE user_id = user_id)
  );

-- InBody: Clients see own, coaches see clients'
ALTER TABLE inbody_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inbody" ON inbody_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view client inbody" ON inbody_scans
  FOR SELECT USING (
    auth.uid() IN (SELECT coach_id FROM client_profiles WHERE user_id = user_id)
  );

-- Plans: Coaches create and manage, clients view assigned
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches can manage own plans" ON training_plans
  FOR ALL USING (auth.uid() = coach_id);

CREATE POLICY "Clients can view assigned plans" ON training_plans
  FOR SELECT USING (
    id IN (SELECT plan_id FROM client_plans WHERE user_id = auth.uid())
  );

-- ============================================================
-- EXERCISE LIBRARY INDEXES
-- ============================================================

CREATE INDEX idx_food_name ON food_inventory(name);
CREATE INDEX idx_food_category ON food_inventory(category);
CREATE INDEX idx_rehab_body_part ON rehab_library(body_part);
CREATE INDEX idx_rehab_injury ON rehab_library(injury_type);

-- ============================================================
-- FULL TEXT SEARCH
-- ============================================================

CREATE INDEX idx_exercise_name_search ON exercise_library USING gin(to_tsvector('english', name));
CREATE INDEX idx_food_name_search ON food_inventory USING gin(to_tsvector('english', name));
CREATE INDEX idx_rehab_search ON rehab_library USING gin(to_tsvector('english', name));
