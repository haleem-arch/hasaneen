import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Dumbbell, Search, Plus, Filter, 
  ExternalLink, Info, X, PlayCircle 
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  category: string;
  equipment: string;
  difficulty: string;
  video_url: string;
}

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .order('name', { ascending: true });

    if (!error) setExercises(data || []);
    setLoading(false);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Exercise Library</h1>
          <p className="text-gray-400">Manage your database of movement patterns</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add Exercise
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:bg-white/10 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {muscleGroups.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-4 py-2 rounded-xl border whitespace-nowrap transition-all ${
                selectedMuscle === muscle 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-surface border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500 italic">Loading exercises...</div>
        ) : filteredExercises.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 italic">No exercises found.</div>
        ) : (
          filteredExercises.map((ex, i) => (
            <motion.div 
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group hover:border-primary/30 transition-all overflow-hidden"
            >
              <div className="h-40 bg-white/5 flex items-center justify-center relative">
                <Dumbbell size={40} className="text-gray-700 group-hover:text-primary transition-colors" />
                {ex.video_url && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={48} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight">{ex.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
                  {ex.muscle_group} • {ex.equipment}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-2 rounded-lg transition-all border border-white/5 flex items-center justify-center gap-2">
                    <Info size={14} />
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Exercise Modal (Simplified for now) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative glass-card w-full max-w-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Add New Exercise</h2>
              <p className="text-gray-500 mb-8 italic text-sm">Fill in the details for the exercise library.</p>
              {/* Form fields here */}
              <button onClick={() => setIsAddModalOpen(false)} className="w-full bg-primary py-4 rounded-xl font-bold">
                Save Exercise
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
