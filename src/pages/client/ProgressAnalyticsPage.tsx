import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingDown, TrendingUp, Scale, 
  Activity, Zap, Calendar, Plus 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ProgressAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, [user]);

  const fetchScans = async () => {
    if (!user) return;
    const { data: scans } = await supabase
      .from('inbody_scans')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    setData(scans || []);
    setLoading(false);
  };

  const latest = data[data.length - 1] || {};
  const previous = data[data.length - 2] || {};

  const getDiff = (key: string) => {
    if (!latest[key] || !previous[key]) return 0;
    return (latest[key] - previous[key]).toFixed(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold">Body Analytics</h1>
        <p className="text-gray-400">Track your transformation metrics</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Current Weight" 
          value={`${latest.weight || '--'} kg`} 
          diff={getDiff('weight')}
          icon={<Scale className="text-blue-400" />}
          unit="kg"
        />
        <StatCard 
          label="Skeletal Muscle" 
          value={`${latest.smm || '--'} kg`} 
          diff={getDiff('smm')}
          icon={<Zap className="text-orange-400" />}
          unit="kg"
          isPositiveGood={true}
        />
        <StatCard 
          label="Body Fat %" 
          value={`${latest.bf_percent || '--'}%`} 
          diff={getDiff('bf_percent')}
          icon={<Activity className="text-emerald-400" />}
          unit="%"
          isPositiveGood={false}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Scale size={18} className="text-primary" />
            Weight Trend
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis stroke="#666" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="weight" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Zap size={18} className="text-orange-400" />
            Body Composition
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="smm" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316' }} name="Muscle Mass" />
                <Line type="monotone" dataKey="bfm" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} name="Fat Mass" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Manual Entry Placeholder */}
      <div className="glass-card p-8 border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Calendar className="text-gray-500" />
        </div>
        <h3 className="text-xl font-bold">InBody Session?</h3>
        <p className="text-gray-400 max-w-sm mt-2 mb-6 text-sm">Have a new scan? Ask your coach to upload the results to see your updated analytics here.</p>
        <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/5">
          <Plus size={16} />
          View History
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, diff, icon, unit, isPositiveGood = false }: any) {
  const d = parseFloat(diff);
  const isNeutral = d === 0;
  const isUp = d > 0;
  const isGood = isPositiveGood ? isUp : !isUp;

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>
      
      {!isNeutral && (
        <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${isGood ? 'text-emerald-400' : 'text-error'}`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isUp ? '+' : ''}{diff}{unit} since last scan
        </div>
      )}
    </div>
  );
}
