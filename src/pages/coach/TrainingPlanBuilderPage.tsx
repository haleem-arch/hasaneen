import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Plus, ClipboardList, Dumbbell, 
  Trash2, GripVertical, Save, 
  ChevronDown, ChevronUp, Search, X
} from 'lucide-react';

interface PlanDay {
  id: string;
  name: string;
  exercises: any[];
}

export default function TrainingPlanBuilderPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>({
    name: '',
    description: '',
    days: []
  });
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchExercise, setSearchExercise] = useState('');
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchExercises();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase.from('training_plans').select('*').order('created_at', { ascending: false });
    setPlans(data || []);
  };

  const fetchExercises = async () => {
    const { data } = await supabase.from('exercise_library').select('*').order('name', { ascending: true });
    setExercises(data || []);
  };

  const addDay = () => {
    setCurrentPlan({
      ...currentPlan,
      days: [...currentPlan.days, { name: `Day ${currentPlan.days.length + 1}`, exercises: [] }]
    });
  };

  const addExerciseToDay = (dayIndex: number, exercise: any) => {
    const updatedDays = [...currentPlan.days];
    updatedDays[dayIndex].exercises.push({
      ...exercise,
      id: Math.random().toString(36).substr(2, 9), // Local temp ID
      library_id: exercise.id,
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      rest: 90
    });
    setCurrentPlan({ ...currentPlan, days: updatedDays });
    setActiveDayIndex(null);
  };

  const removeExercise = (dayIndex: number, exerciseId: string) => {
    const updatedDays = [...currentPlan.days];
    updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter((e: any) => e.id !== exerciseId);
    setCurrentPlan({ ...currentPlan, days: updatedDays });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Plan Builder</h1>
          <p className="text-gray-400">Design structured training programs</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all"
          >
            <Plus size={20} />
            New Program
          </button>
        )}
      </header>

      {isCreating ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Plan Info */}
          <div className="glass-card p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="Program Name (e.g. 12-Week Hypertrophy)"
                  className="text-2xl font-bold bg-transparent border-none outline-none w-full placeholder:text-white/20"
                  value={currentPlan.name}
                  onChange={(e) => setCurrentPlan({...currentPlan, name: e.target.value})}
                />
                <textarea 
                  placeholder="Program description..."
                  className="bg-transparent border-none outline-none w-full mt-2 text-gray-400 resize-none h-12"
                  value={currentPlan.description}
                  onChange={(e) => setCurrentPlan({...currentPlan, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="bg-white/5 hover:bg-white/10 text-gray-400 px-6 py-2 rounded-xl font-bold border border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                  <Save size={18} />
                  Save Program
                </button>
              </div>
            </div>

            {/* Days Section */}
            <div className="space-y-6">
              {currentPlan.days.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-4 bg-white/5 flex justify-between items-center">
                    <input 
                      type="text"
                      className="bg-transparent border-none font-bold outline-none"
                      value={day.name}
                      onChange={(e) => {
                        const updated = [...currentPlan.days];
                        updated[dayIndex].name = e.target.value;
                        setCurrentPlan({...currentPlan, days: updated});
                      }}
                    />
                    <button className="text-gray-500 hover:text-error transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {day.exercises.map((ex: any) => (
                      <div key={ex.id} className="glass-card bg-surface/80 p-4 flex items-center gap-4 group">
                        <GripVertical className="text-gray-700 group-hover:text-gray-500 transition-colors" size={20} />
                        <div className="flex-1">
                          <p className="font-bold">{ex.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{ex.muscle_group}</p>
                        </div>
                        <div className="flex gap-6 items-center">
                          <div className="text-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Sets</p>
                            <input type="number" value={ex.sets} className="bg-transparent w-8 text-center font-bold" />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Reps</p>
                            <div className="flex items-center gap-1">
                              <input type="number" value={ex.reps_min} className="bg-transparent w-6 text-center font-bold" />
                              <span className="text-gray-600">-</span>
                              <input type="number" value={ex.reps_max} className="bg-transparent w-6 text-center font-bold" />
                            </div>
                          </div>
                          <button 
                            onClick={() => removeExercise(dayIndex, ex.id)}
                            className="text-gray-600 hover:text-error transition-colors p-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => setActiveDayIndex(dayIndex)}
                      className="w-full py-4 border-2 border-dashed border-white/5 hover:border-primary/20 hover:bg-primary/5 rounded-2xl text-gray-500 hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <Plus size={18} />
                      Add Exercise to {day.name}
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={addDay}
                className="w-full py-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 text-gray-400 font-bold transition-all flex items-center justify-center gap-3"
              >
                <Plus size={24} />
                Add Another Training Day
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="glass-card p-6 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                <ClipboardList size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-6">{plan.description || 'No description provided.'}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                <span>Active Clients: 0</span>
                <span>4 Weeks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Picker Overlay */}
      <AnimatePresence>
        {activeDayIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveDayIndex(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border-white/10"
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add Exercise</h2>
                  <button onClick={() => setActiveDayIndex(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="text"
                    placeholder="Search library..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white/10"
                    value={searchExercise}
                    onChange={(e) => setSearchExercise(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {exercises.filter(ex => ex.name.toLowerCase().includes(searchExercise.toLowerCase())).map(ex => (
                  <button 
                    key={ex.id}
                    onClick={() => addExerciseToDay(activeDayIndex!, ex)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-xl transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="font-bold">{ex.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{ex.muscle_group} • {ex.equipment}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
