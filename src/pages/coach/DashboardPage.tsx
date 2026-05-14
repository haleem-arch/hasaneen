import { motion } from 'framer-motion';
import { Users, ClipboardList, Activity, Settings } from 'lucide-react';

export default function CoachDashboard() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Coach Dashboard</h1>
        <p className="text-gray-400">Welcome back, Hasaneen.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Clients', value: '184', icon: Users, color: 'text-blue-400' },
          { label: 'Pending Plans', value: '12', icon: ClipboardList, color: 'text-amber-400' },
          { label: 'Session Adherence', value: '94%', icon: Activity, color: 'text-emerald-400' },
          { label: 'App Status', value: 'Live', icon: Settings, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Recent Client Activity</h2>
        <div className="space-y-4">
          <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
