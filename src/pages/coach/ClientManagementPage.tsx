import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Edit2, Check, Plus, Trash2,
  Search, Dumbbell, X, MoreVertical
} from 'lucide-react';

export default function ClientManagementPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (clientId) fetchClientProfile();
  }, [clientId]);

  const fetchClientProfile = async () => {
    const { data, error } = await supabase
      .from('client_profiles')
      .select(`*, user:profiles(id, username, email, display_name, created_at)`)
      .eq('user_id', clientId)
      .single();

    if (error) {
      toast.error('Client not found');
      navigate('/coach/clients');
      return;
    }

    setClient(data);

    const { data: days } = await supabase
      .from('client_workout_days')
      .select('*')
      .eq('user_id', clientId)
      .order('day_number', { ascending: true });

    setWorkoutDays(days || []);
    setLoading(false);
  };

  const handleUpdateDaysPerWeek = async (newDays: number) => {
    const existingCount = workoutDays.length;
    if (newDays > existingCount) {
      const toAdd = [];
      for (let i = existingCount + 1; i <= newDays; i++) {
        toAdd.push({ user_id: clientId, day_number: i, day_name: `Day ${i}`, exercises: [] });
      }
      await supabase.from('client_workout_days').insert(toAdd);
    } else if (newDays < existingCount) {
      for (let i = newDays + 1; i <= existingCount; i++) {
        const d = workoutDays.find(x => x.day_number === i);
        if (d) await supabase.from('client_workout_days').delete().eq('id', d.id);
      }
    }
    await supabase.from('client_profiles').update({ workouts_per_week: newDays }).eq('user_id', clientId);
    toast.success(`Updated to ${newDays} days/week`);
    fetchClientProfile();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!client) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 group transition-colors">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Hero Card */}
      <div className="glass-card p-8 mb-8 relative overflow-hidden border-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-20 -mt-20 rounded-full pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/40">
              {client.user?.display_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black">{client.user?.display_name}</h1>
              <p className="text-gray-500 text-sm mt-1">@{client.user?.username} &bull; {client.user?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-primary/20 text-primary px-3 py-0.5 rounded-full text-xs font-bold uppercase border border-primary/20">
                  {client.experience_level ?? 'Beginner'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all ${editMode ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
          >
            {editMode ? <Check size={18} /> : <Edit2 size={18} />}
            {editMode ? 'Done Editing' : 'Edit Program'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5">
          <Stat label="Passcode" value={client.generated_passcode ?? '—'} />
          <Stat label="Age" value={client.age ? `${client.age} y/o` : '—'} />
          <Stat label="Height" value={client.height ? `${client.height} cm` : '—'} />
          <Stat label="Schedule" value={`${client.workouts_per_week ?? 3} Days/Week`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Program Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">Training Program</h2>
            {editMode && (
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-xs text-gray-500 font-bold uppercase">Days/Week</span>
                <select
                  value={client.workouts_per_week ?? 3}
                  onChange={e => handleUpdateDaysPerWeek(parseInt(e.target.value))}
                  className="bg-transparent outline-none text-sm font-bold cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
          </div>

          {workoutDays.map(day => (
            <WorkoutDayCard
              key={day.id}
              day={day}
              editMode={editMode}
              onUpdate={fetchClientProfile}
            />
          ))}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">Body Composition</h2>
            <InBodyHistory clientId={clientId} />
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">Coach Notes</h2>
            <ProgressNotes clientId={clientId} coachId={client.coach_id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold font-mono">{value}</p>
    </div>
  );
}

function WorkoutDayCard({ day, editMode, onUpdate }: any) {
  const [dayName, setDayName] = useState(day.day_name);
  const [showSearch, setShowSearch] = useState(false);

  const renameDay = async (name: string) => {
    setDayName(name);
    await supabase.from('client_workout_days').update({ day_name: name }).eq('id', day.id);
  };

  const removeExercise = async (idx: number) => {
    const updated = [...(day.exercises ?? [])];
    updated.splice(idx, 1);
    await supabase.from('client_workout_days').update({ exercises: updated }).eq('id', day.id);
    onUpdate();
  };

  const addExercise = async (ex: any) => {
    const updated = [...(day.exercises ?? []), { ...ex, sets: 3, reps_min: 8, reps_max: 12 }];
    await supabase.from('client_workout_days').update({ exercises: updated }).eq('id', day.id);
    setShowSearch(false);
    onUpdate();
  };

  return (
    <div className="glass-card bg-white/5 border-white/5 p-6">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 font-bold text-sm">
            {day.day_number}
          </span>
          {editMode ? (
            <input
              value={dayName}
              onChange={e => renameDay(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-base font-bold outline-none focus:border-primary/50 transition-all"
              placeholder="e.g. Push Day"
            />
          ) : (
            <h3 className="text-lg font-bold">{dayName}</h3>
          )}
        </div>
        {editMode && (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all uppercase"
          >
            <Plus size={14} /> Add Exercise
          </button>
        )}
      </div>

      <div className="space-y-2">
        {(day.exercises ?? []).map((ex: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                <Dumbbell size={14} />
              </div>
              <div>
                <p className="text-sm font-bold">{ex.name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {ex.sets} Sets &bull; {ex.reps_min}-{ex.reps_max} Reps
                </p>
              </div>
            </div>
            {editMode && (
              <button onClick={() => removeExercise(i)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {(!day.exercises || day.exercises.length === 0) && (
          <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No exercises yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSearch && (
          <ExerciseSearchModal onSelect={addExercise} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseSearchModal({ onSelect, onClose }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    supabase
      .from('exercise_library')
      .select('*')
      .ilike('name', `%${search}%`)
      .limit(8)
      .then(({ data }) => setResults(data ?? []));
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
        className="relative glass-card w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Search Exercises</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={22} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="e.g. Bench Press, Squat..."
              className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 outline-none focus:bg-white/10 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {results.map(ex => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Dumbbell size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm">{ex.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{ex.muscle_group} &bull; {ex.equipment}</p>
                </div>
              </div>
              <Plus size={18} className="text-gray-700 group-hover:text-primary transition-colors" />
            </button>
          ))}
          {search.length >= 2 && results.length === 0 && (
            <p className="text-center py-8 text-gray-500 italic">No results for "{search}"</p>
          )}
          {search.length < 2 && (
            <p className="text-center py-8 text-gray-600 text-sm">Type at least 2 characters to search...</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InBodyHistory({ clientId }: any) {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('inbody_scans')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false })
      .limit(5)
      .then(({ data }) => setScans(data ?? []));
  }, [clientId]);

  if (scans.length === 0) return <p className="text-gray-600 text-sm italic">No scans recorded yet.</p>;

  return (
    <div className="space-y-3">
      {scans.map(scan => (
        <div key={scan.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold">{new Date(scan.date).toLocaleDateString()}</p>
            <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-400/20">
              Score {scan.inbody_score}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><p className="text-gray-500 font-bold">Weight</p><p className="font-bold">{scan.weight}kg</p></div>
            <div><p className="text-gray-500 font-bold">Muscle</p><p className="font-bold">{scan.smm}kg</p></div>
            <div><p className="text-gray-500 font-bold">Fat%</p><p className="font-bold">{scan.bf_percent}%</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressNotes({ clientId, coachId }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');

  const fetchNotes = () => {
    supabase
      .from('progress_notes')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false })
      .then(({ data }) => setNotes(data ?? []));
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder="Add a note..."
          className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/10 transition-all"
        />
        <button onClick={addNote} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
          Add
        </button>
      </div>
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {notes.map(note => (
          <div key={note.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold mb-1">{new Date(note.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-300">{note.note}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-gray-600 text-sm italic">No notes yet.</p>}
      </div>
    </div>
  );
}
