import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User, Upload, FileText, Activity, Check, ChevronLeft, Copy, CheckCircle } from 'lucide-react';

// ─── Passcode Modal ───────────────────────────────────────────────────────────
function PasscodeModal({ passcode, email, clientName, onDone }: {
  passcode: string;
  email: string;
  clientName: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(`Name: ${clientName}\nEmail: ${email}\nPassword: ${passcode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-md p-8 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-black">Client Created! 🎉</h2>
          <p className="text-gray-400 mt-2">Share these credentials with <span className="text-white font-bold">{clientName}</span></p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email</p>
            <p className="font-mono text-white font-bold">{email}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Password / Passcode</p>
            <p className="font-mono text-3xl font-black text-white tracking-widest">{passcode}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={copyAll}
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-2xl font-bold transition-all"
          >
            {copied ? <><CheckCircle size={18} className="text-emerald-400" /> Copied!</> : <><Copy size={18} /> Copy Credentials</>}
          </button>
          <button
            onClick={onDone}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-2xl font-black transition-all"
          >
            Go to Client Profile →
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [createdClient, setCreatedClient] = useState<{ passcode: string; email: string; name: string; userId: string } | null>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parseInBodyCSV = (file: File): Promise<any> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const d: any = {};
        lines.forEach(line => {
          const lower = line.toLowerCase();
          const val = () => parseFloat(line.split(':')[1]) || parseFloat(line.split(',')[1]) || 0;
          if (lower.includes('weight') && !lower.includes('skeletal') && !lower.includes('fat')) d.weight = val();
          if (lower.includes('skeletal muscle mass') || lower.includes('smm')) d.smm = val();
          if (lower.includes('body fat mass') || lower.includes('bfm')) d.bfm = val();
          if (lower.includes('body fat %') || lower.includes('pbf')) d.bf_percent = val();
          if (lower.includes('bmr')) d.bmr = val();
          if (lower.includes('inbody score')) d.inbody_score = val();
        });
        resolve(d);
      };
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // ── Get coach session (never changes with Admin API approach) ─────────
      const { data: { session: coachSession } } = await supabase.auth.getSession();
      const coachId = coachSession?.user?.id;
      if (!coachSession || !coachId) throw new Error('Coach session not found. Please sign in again.');

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

      // ── Use Admin API — does NOT affect client session at all ─────────────
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: passcode,
          email_confirm: true,
          user_metadata: {
            display_name: formData.display_name,
            role: 'client',
            username: formData.username
          }
        })
      });

      const userData = await res.json();
      if (!res.ok) throw new Error(userData.message || userData.msg || 'Failed to create user');
      const userId = userData.id;
      if (!userId) throw new Error('No user ID returned from Admin API');

      // ── Coach is still logged in — write all data safely ─────────────────
      const { error: cpError } = await supabase.from('client_profiles').insert({
        user_id: userId,
        coach_id: coachId,
        age: parseInt(formData.age) || null,
        height: parseFloat(formData.height) || null,
        experience_level: formData.experience_level,
        workouts_per_week: parseInt(String(formData.workouts_per_week)),
        goals: formData.goals,
        injuries_notes: formData.injuries_notes,
        generated_passcode: passcode
      });
      if (cpError) throw cpError;

      if (inbodyFile) {
        const inbody: any = await parseInBodyCSV(inbodyFile);
        await supabase.from('inbody_scans').insert({
          user_id: userId, coach_id: coachId,
          date: new Date().toISOString().split('T')[0],
          weight: inbody.weight || 0, smm: inbody.smm || 0,
          bfm: inbody.bfm || 0, bf_percent: inbody.bf_percent || 0,
          bmr: inbody.bmr || 0, inbody_score: inbody.inbody_score || 0
        });
      }

      const days = Array.from({ length: parseInt(String(formData.workouts_per_week)) }, (_, i) => ({
        user_id: userId, day_number: i + 1, day_name: `Day ${i + 1}`, exercises: []
      }));
      await supabase.from('client_workout_days').insert(days);

      // ── Show passcode modal (coach is still logged in!) ───────────────────
      setCreatedClient({ passcode, email: formData.email, name: formData.display_name, userId });

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {createdClient && (
        <PasscodeModal
          passcode={createdClient.passcode}
          email={createdClient.email}
          clientName={createdClient.name}
          onDone={() => navigate(`/coach/clients/${createdClient.userId}`)}
        />
      )}

      <div className="p-6 max-w-3xl mx-auto pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 group transition-colors">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Add New Athlete</h1>
        <p className="text-gray-400 mb-8">Onboard a new client and set up their initial program.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400"><User size={20} /></div>
              <h2 className="text-xl font-bold">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Name *</label>
                <input name="display_name" value={formData.display_name} onChange={handleChange} required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all placeholder:text-gray-600"
                  placeholder="e.g. Ahmed Hassan" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Username *</label>
                <input name="username" value={formData.username} onChange={handleChange} required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all placeholder:text-gray-600"
                  placeholder="ahmed123" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 outline-none focus:bg-white/10 transition-all placeholder:text-gray-600"
                    placeholder="ahmed@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Age</label>
                <input name="age" type="number" value={formData.age} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all placeholder:text-gray-600"
                  placeholder="25" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Height (cm)</label>
                <input name="height" type="number" value={formData.height} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all placeholder:text-gray-600"
                  placeholder="180" />
              </div>
            </div>
          </div>

          {/* Training */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-400/10 text-orange-400"><FileText size={20} /></div>
              <h2 className="text-xl font-bold">Training & Goals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Experience Level</label>
                <select name="experience_level" value={formData.experience_level} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all cursor-pointer">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Days Per Week</label>
                <select name="workouts_per_week" value={formData.workouts_per_week} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all cursor-pointer">
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Days / Week</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Goals</label>
                <textarea name="goals" value={formData.goals} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all resize-none h-24 placeholder:text-gray-600"
                  placeholder="e.g. Build muscle, lose fat, improve endurance..." />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Injuries / Limitations</label>
                <textarea name="injuries_notes" value={formData.injuries_notes} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:bg-white/10 transition-all resize-none h-20 placeholder:text-gray-600"
                  placeholder="Any injuries we should know about?" />
              </div>
            </div>
          </div>

          {/* InBody */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400"><Activity size={20} /></div>
              <h2 className="text-xl font-bold">InBody CSV (Optional)</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Upload a CSV export from an InBody machine to set initial body composition data.</p>
            <div className="relative border-2 border-dashed border-white/5 rounded-2xl p-10 text-center group hover:border-primary/40 transition-all cursor-pointer">
              <input type="file" accept=".csv" onChange={e => setInbodyFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className={`p-4 rounded-full transition-all ${inbodyFile ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  {inbodyFile ? <Check size={28} /> : <Upload size={28} />}
                </div>
                <p className="font-bold text-gray-300">{inbodyFile ? inbodyFile.name : 'Click or drop a .csv file here'}</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Athlete...</>
            ) : (
              <><UserPlus size={22} /> Confirm & Onboard Athlete</>
            )}
          </button>
        </form>
      </div>
    </>
  );
}

