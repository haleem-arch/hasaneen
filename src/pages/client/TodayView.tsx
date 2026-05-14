import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, Utensils, Droplets, 
  Flame, CheckCircle2, ChevronRight,
  TrendingUp, Calendar, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ClientTodayView() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);
  const [macros, setMacros] = useState({
    protein: { current: 145, target: 200 },
    carbs: { current: 210, target: 250 },
    fats: { current: 55, target: 70 },
    calories: { current: 1915, target: 2430 }
  });

  useEffect(() => {
    // Placeholder for fetching today's assigned workout
    setLoading(false);
  }, []);

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Today's Focus</h1>
          <p className="text-gray-500 text-sm">Thursday, May 14</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Calendar size={24} />
        </div>
      </header>

      {/* Workout Card */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Assigned Training</h2>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/20 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <Dumbbell size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Zap size={16} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-wider">High Intensity</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Push Day A</h3>
            <p className="text-gray-400 text-sm mb-6">Chest, Shoulders & Triceps Focus</p>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium">6 Exercises</div>
              <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium">65 Minutes</div>
            </div>

            <button className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              Start Workout
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Macros Section */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Nutrition Tracker</h2>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{macros.calories.current}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Calories Consumed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Target: {macros.calories.target}</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Protein', key: 'protein', color: 'bg-blue-400' },
              { label: 'Carbs', key: 'carbs', color: 'bg-emerald-400' },
              { label: 'Fats', key: 'fats', color: 'bg-purple-400' }
            ].map((macro) => {
              const data = (macros as any)[macro.key];
              const percent = Math.min(100, (data.current / data.target) * 100);
              return (
                <div key={macro.key}>
                  <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wider">
                    <span className="text-gray-400">{macro.label}</span>
                    <span>{data.current}g / {data.target}g</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={`h-full ${macro.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Daily Checklist</h2>
        <div className="space-y-3">
          {[
            { label: '8,000 Steps', icon: TrendingUp, color: 'text-emerald-400' },
            { label: '3L Water', icon: Droplets, color: 'text-blue-400' },
            { label: 'Log InBody (If due)', icon: Activity, color: 'text-purple-400' }
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <CheckCircle2 size={16} className="text-transparent group-hover:text-primary/30" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <div className="text-primary flex flex-col items-center gap-1">
            <Zap size={24} />
            <span className="text-[10px] font-bold uppercase">Today</span>
          </div>
          <div className="text-gray-500 flex flex-col items-center gap-1">
            <Calendar size={24} />
            <span className="text-[10px] font-bold uppercase">History</span>
          </div>
          <div className="text-gray-500 flex flex-col items-center gap-1">
            <TrendingUp size={24} />
            <span className="text-[10px] font-bold uppercase">Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Activity icon for the checklist
function Activity({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
