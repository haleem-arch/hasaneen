import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  ChevronLeft, Edit2, Check, X, 
  Plus, Trash2, Search, Dumbbell,
  Scale, Activity, FileText, Calendar,
  MoreVertical, Info
} from 'lucide-react';

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientProfile();
    }
  }, [clientId]);

  const fetchClientProfile = async () => {
    const { data, error } = await supabase
      .from('client_profiles')
      .select(`
        *,
        user:profiles(id, username, email, display_name, created_at)
      `)
      .eq('user_id', clientId)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      toast.error('Client not found');
      navigate('/coach/dashboard');
      return;
    }

    setClient(data);
    
    // Fetch workout days
    const { data: days } = await supabase
      .from('client_workout_days')
      .select('*')
      .eq('user_id', clientId)
      .order('day_number', { ascending: true });

    setWorkoutDays(days || []);
    setLoading(false);
  };

  const handleUpdateDaysPerWeek = async (newDaysPerWeek: number) => {
    const existingDays = workoutDays.length;
    if (newDaysPerWeek > existingDays) {
      const newDays = [];
      for (let i = existingDays + 1; i <= newDaysPerWeek; i++) {
        newDays.push({
          user_id: clientId,
          day_number: i,
          day_name: `Day ${i}`,
          exercises: []
        });
      }
      await supabase.from('client_workout_days').insert(newDays);
    } else if (newDaysPerWeek < existingDays) {
      // Delete excess days (simple approach)
      await supabase
        .from('client_workout_days')
        .delete()
        .eq('user_id', clientId)
        .gt('day_number', newDaysPerWeek);
    }

    await supabase
      .from('client_profiles')
      .update({ workouts_per_week: newDaysPerWeek })
      .eq('user_id', clientId);

    toast.success(`Schedule updated to ${newDaysPerWeek} days/week`);
    fetchClientProfile();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      {/* Header Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Hero Profile Card */}
      <section className="relative overflow-hidden glass-card p-10 mb-8 border-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/40">
              {client.user?.display_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-black">{client.user?.display_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                  {client.experience_level || 'Beginner'}
                </span>
                <span className="text-gray-500 text-sm font-medium">@{client.user?.username}</span>
                <span className="text-gray-700">•</span>
                <span className="text-gray-500 text-sm font-medium">Member since {new Date(client.user?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                editMode 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-white/5 border border-white/5 text-white hover:bg-white/10'
              }`}
            >
              {editMode ? <Check size={20} /> : <Edit2 size={18} />}
              {editMode ? 'Save Changes' : 'Manage Program'}
            </button>
            <button className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-500 hover:text-white transition-all">
              <MoreVertical size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 border-t border-white/5 pt-8">
          <DetailStat label="Passcode" value={client.generated_passcode} />
          <DetailStat label="Weight" value={`${client.starting_weight || '--'} kg`} />
          <DetailStat label="Height" value={`${client.height || '--'} cm`} />
          <DetailStat label="Schedule" value={`${client.workouts_per_week} Days/Week`} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Program Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Training Program</h2>
            {editMode && (
              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-500 uppercase ml-2">Days / Week</span>
                <select 
                  className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                  value={client.workouts_per_week}
                  onChange={(e) => handleUpdateDaysPerWeek(parseInt(e.target.value))}
                >
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {workoutDays.map((day) => (
              <WorkoutDayCard 
                key={day.id} 
                day={day} 
                editMode={editMode} 
                onUpdate={fetchClientProfile} 
              />
            ))}
          </div>
        </div>

        {/* Right Column: History & Notes */}
        <div className="space-y-8">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-emerald-400" />
              Recent Scans
            </h2>
            <InBodyHistory clientId={clientId} />
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              Coach Notes
            </h2>
            <ProgressNotes clientId={clientId} coachId={client.coach_id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold text-white font-mono">{value}</p>
    </div>
  );
}

function WorkoutDayCard({ day, editMode, onUpdate }: any) {
  const [dayName, setDayName] = useState(day.day_name);
  const [showSearch, setShowSearch] = useState(false);

  const handleRenameDay = async (newName: string) => {
    setDayName(newName);
    await supabase.from('client_workout_days').update({ day_name: newName }).eq('id', day.id);
  };

  const removeExercise = async (idx: number) => {
    const updated = [...(day.exercises || [])];
    updated.splice(idx, 1);
    await supabase.from('client_workout_days').update({ exercises: updated }).eq('id', day.id);
    onUpdate();
  };

  return (
    <div className="glass-card bg-white/5 border-white/5 p-6 hover:border-primary/20 transition-all group">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 font-bold border border-white/5">
            {day.day_number}
          </div>
          {editMode ? (
            <input 
              className="bg-white/5 border border-white/5 rounded-lg px-4 py-2 font-bold text-lg outline-none focus:border-primary/50 transition-all"
              value={dayName}
              onChange={(e) => handleRenameDay(e.target.value)}
              placeholder="e.g. Push Day"
            />
          ) : (
            <h3 className="text-xl font-bold">{dayName}</h3>
          )}
        </div>
        {editMode && (
          <button 
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
          >
            <Plus size={16} />
            Add Exercise
          </button>
        )}
      </div>

      <div className="space-y-3">
        {(day.exercises || []).map((ex: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group/ex">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                <Dumbbell size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">{ex.name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {ex.sets} Sets • {ex.reps_min}-{ex.reps_max} Reps
                </p>
              </div>
            </div>
            {editMode && (
              <button 
                onClick={() => removeExercise(i)}
                className="p-2 text-gray-600 hover:text-error transition-colors opacity-0 group-ex/ex:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        
        {(!day.exercises || day.exercises.length === 0) && (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No exercises assigned yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSearch && (
          <ExerciseSearchModal 
            onSelect={async (ex) => {
              const updated = [...(day.exercises || []), ex];
              await supabase.from('client_workout_days').update({ exercises: updated }).eq('id', day.id);
              setShowSearch(false);
              onUpdate();
            }}
            onClose={() => setShowSearch(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseSearchModal({ onSelect, onClose }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (search.length < 2) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('exercise_library')
        .select('*')
        .ilike('name', `%${search}%`)
        .limit(8);
      setResults(data || []);
    };
    fetch();
  }, [search]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass-card w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Add Exercise</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              autoFocus
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white/10 transition-all"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {results.map((ex) => (
            <button 
              key={ex.id}
              onClick={() => onSelect({ ...ex, sets: 3, reps_min: 8, reps_max: 12 })}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/5 transition-all group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <p className="font-bold">{ex.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{ex.muscle_group} • {ex.equipment}</p>
                </div>
              </div>
              <Plus size={20} className="text-gray-700 group-hover:text-primary" />
            </button>
          ))}
          {results.length === 0 && search.length > 2 && (
            <p className="text-center py-10 text-gray-500 italic">No exercises found for "{search}"</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InBodyHistory({ clientId }: any) {
  const [scans, setScans] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('inbody_scans').select('*').eq('user_id', clientId).order('date', { ascending: false }).limit(5)
      .then(({ data }) => setScans(data || []));
  }, [clientId]);

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <div key={scan.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-gray-300">{new Date(scan.date).toLocaleDateString()}</p>
            <span className="text-[10px] bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">SCORE {scan.inbody_score}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ScanMiniStat label="Weight" val={`${scan.weight}kg`} />
            <ScanMiniStat label="Muscle" val={`${scan.smm}kg`} />
            <ScanMiniStat label="Fat %" val={`${scan.bf_percent}%`} />
          </div>
        </div>
      ))}
      {scans.length === 0 && <p className="text-center py-4 text-gray-600 italic">No scan history</p>}
    </div>
  );
}

function ScanMiniStat({ label, val }: any) {
  return (
    <div>
      <p className="text-[9px] text-gray-500 uppercase font-black">{label}</p>
      <p className="text-xs font-bold text-white">{val}</p>
    </div>
  );
}

function ProgressNotes({ clientId, coachId }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');

  const fetchNotes = () => {
    supabase.from('progress_notes').select('*').eq('user_id', clientId).order('date', { ascending: false })
      .then(({ data }) => setNotes(data || []));
  };

  useEffect(() => { fetchNotes(); }, [clientId]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from('progress_notes').insert({
      user_id: clientId,
      coach_id: coachId,
      date: new Date().toISOString().split('T')[0],
      note: newNote,
      category: 'general'
    });
    setNewNote('');
    fetchNotes();
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <input 
          className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-4 pr-12 outline-none focus:bg-white/10 transition-all text-sm"
          placeholder="Quick note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
        />
        <button onClick={addNote} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all">
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {notes.map((note) => (
          <div key={note.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-gray-600 font-bold mb-1">{new Date(note.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
