import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserPlus, Mail, User, Info, 
  ChevronRight, Upload, FileText, Check 
} from 'lucide-react';

export default function AddClientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    email: '',
    age: '',
    height: '',
    experience_level: 'beginner',
    workouts_per_week: 3,
    goals: '',
    injuries_notes: ''
  });
  const [inbodyFile, setInbodyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePasscode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      setInbodyFile(e.target.files[0]);
    }
  };

  const parseInBodyCSV = async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const inbodyData: any = {};

        lines.forEach((line) => {
          if (line.toLowerCase().includes('weight')) inbodyData.weight = parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]);
          if (line.toLowerCase().includes('skeletal muscle mass') || line.toLowerCase().includes('smm')) inbodyData.smm = parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]);
          if (line.toLowerCase().includes('body fat mass') || line.toLowerCase().includes('bfm')) inbodyData.bfm = parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]);
          if (line.toLowerCase().includes('body fat %') || line.toLowerCase().includes('pbf')) inbodyData.bf_percent = parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]);
          if (line.toLowerCase().includes('bmr')) inbodyData.bmr = parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]);
          if (line.toLowerCase().includes('inbody score')) inbodyData.inbody_score = parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]);
        });

        resolve(inbodyData);
      };
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const passcode = generatePasscode();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: passcode,
        options: {
          data: {
            display_name: formData.display_name,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      const userId = authData.user.id;
      const { data: { user: coachUser } } = await supabase.auth.getUser();

      if (!coachUser) throw new Error('Coach session not found');

      // 2. Create client profile (Triggers might handle profiles table, so we use upsert/insert)
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          user_id: userId,
          coach_id: coachUser.id,
          age: parseInt(formData.age) || null,
          height: parseFloat(formData.height) || null,
          experience_level: formData.experience_level,
          workouts_per_week: formData.workouts_per_week,
          goals: formData.goals,
          injuries_notes: formData.injuries_notes,
          generated_passcode: passcode
        });

      if (profileError) throw profileError;

      // 3. Parse and upload InBody CSV if provided
      if (inbodyFile) {
        const inbodyData: any = await parseInBodyCSV(inbodyFile);
        
        await supabase.from('inbody_scans').insert({
          user_id: userId,
          coach_id: coachUser.id,
          date: new Date().toISOString().split('T')[0],
          weight: inbodyData.weight || 0,
          smm: inbodyData.smm || 0,
          bfm: inbodyData.bfm || 0,
          bf_percent: inbodyData.bf_percent || 0,
          bmr: inbodyData.bmr || 0,
          inbody_score: inbodyData.inbody_score || 0
        });
      }

      // 4. Create workout days
      const days = [];
      for (let i = 1; i <= formData.workouts_per_week; i++) {
        days.push({
          user_id: userId,
          day_number: i,
          day_name: `Day ${i}`,
          exercises: []
        });
      }
      
      const { error: daysError } = await supabase.from('client_workout_days').insert(days);
      if (daysError) console.error('Error creating days:', daysError);

      toast.success(`Client created! Passcode: ${passcode}`, { duration: 6000 });
      navigate(`/coach/clients/${userId}`);
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Add New Athlete</h1>
        <p className="text-gray-400">Onboard a new client and initialize their training program.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <section className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Name *</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all"
                placeholder="e.g. John Smith"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all"
                placeholder="jsmith123"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:bg-white/10 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all"
                placeholder="25"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all"
                placeholder="180"
              />
            </div>
          </div>
        </section>

        {/* Training Context */}
        <section className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-400/10 text-orange-400">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold">Training & Goals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Experience Level</label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Workouts Per Week</label>
              <select
                name="workouts_per_week"
                value={formData.workouts_per_week}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>{n} Days / Week</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Primary Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all resize-none h-24"
                placeholder="e.g. Build lean muscle mass, improve VO2 Max, prepare for competition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Injuries / Limitations</label>
              <textarea
                name="injuries_notes"
                value={formData.injuries_notes}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all resize-none h-20"
                placeholder="Any past injuries we should be aware of?"
              />
            </div>
          </div>
        </section>

        {/* InBody Integration */}
        <section className="glass-card p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
              <Activity size={20} />
            </div>
            <h2 className="text-xl font-bold">Initial Body Composition</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">Upload a CSV export from an InBody machine to populate initial data.</p>
          
          <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-10 text-center group hover:border-primary/50 transition-all cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="inbody-upload"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 rounded-full bg-white/5 text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                {inbodyFile ? <Check size={32} /> : <Upload size={32} />}
              </div>
              <p className="text-gray-300 font-bold">{inbodyFile ? inbodyFile.name : 'Click or Drag CSV here'}</p>
              <p className="text-xs text-gray-500">Only .csv files accepted</p>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Onboarding Athlete...
            </>
          ) : (
            <>
              <UserPlus size={24} />
              Confirm & Onboard Athlete
            </>
          )}
        </button>
      </form>
    </div>
  );
}
